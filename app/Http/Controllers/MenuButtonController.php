<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\MenuButton;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuButtonController extends Controller
{
    /**
     * Display a listing of menu buttons
     */
    public function index(Request $request): JsonResponse
    {
        $query = MenuButton::with(['parent', 'children']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by parent_id if provided
        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Search by name
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort by sort field and then by created_at
        $query->orderBy('sort')->orderBy('created_at');

        $menuButtons = $query->paginate($request->get('per_page', 15));

        return response()->json($menuButtons);
    }

    /**
     * Store a newly created menu button
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menu_buttons,id',
            'name' => 'required|string|max:255',
            'button_type' => 'required|string|in:store,action',
            'sort' => 'nullable|integer|min:0',
            'status' => 'nullable|integer|in:0,1',
            'media_url' => 'nullable|string|max:500',
            'enable_template' => 'nullable|boolean',
            'template_content' => 'nullable|string',
            'sub_btns' => 'nullable|array',
        ]);

        // Set default values
        $validated['status'] = $validated['status'] ?? 1;
        $validated['sort'] = $validated['sort'] ?? 0;
        $validated['enable_template'] = $validated['enable_template'] ?? false;

        $menuButton = MenuButton::create($validated);
        $menuButton->load(['parent', 'children']);

        return response()->json($menuButton, 201);
    }

    /**
     * Display the specified menu button
     */
    public function show(MenuButton $menuButton): JsonResponse
    {
        $menuButton->load(['parent', 'children', 'descendants']);
        
        return response()->json($menuButton);
    }

    /**
     * Update the specified menu button
     */
    public function update(Request $request, MenuButton $menuButton): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'exists:menu_buttons,id',
                Rule::notIn([$menuButton->id]) // Prevent self-reference
            ],
            'name' => 'required|string|max:255',
            'button_type' => 'required|string|in:store,action',
            'sort' => 'nullable|integer|min:0',
            'status' => 'nullable|integer|in:0,1',
            'media_url' => 'nullable|string|max:500',
            'enable_template' => 'nullable|boolean',
            'template_content' => 'nullable|string',
            'sub_btns' => 'nullable|array',
        ]);

        $menuButton->update($validated);
        $menuButton->load(['parent', 'children']);

        return response()->json($menuButton);
    }

    /**
     * Remove the specified menu button
     */
    public function destroy(MenuButton $menuButton): JsonResponse
    {
        // Check if menu button has children
        if ($menuButton->children()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete menu button with children. Please delete children first.'
            ], 422);
        }

        $menuButton->delete();

        return response()->json(['message' => 'Menu button deleted successfully']);
    }

    /**
     * Get menu button hierarchy (tree structure)
     */
    public function hierarchy(): JsonResponse
    {
        $rootButtons = MenuButton::root()
            ->active()
            ->with(['children' => function ($query) {
                $query->active()->orderBy('sort');
            }])
            ->orderBy('sort')
            ->get();

        return response()->json($rootButtons);
    }

    /**
     * Bulk update menu buttons
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:menu_buttons,id',
            'updates' => 'required|array',
            'updates.status' => 'nullable|integer|in:0,1',
            'updates.parent_id' => 'nullable|exists:menu_buttons,id',
        ]);

        $updated = MenuButton::whereIn('id', $validated['ids'])
            ->update($validated['updates']);

        return response()->json([
            'message' => "Updated {$updated} menu buttons successfully"
        ]);
    }

    /**
     * Bulk delete menu buttons
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:menu_buttons,id',
        ]);

        // Check if any menu button has children
        $buttonsWithChildren = MenuButton::whereIn('id', $validated['ids'])
            ->whereHas('children')
            ->count();

        if ($buttonsWithChildren > 0) {
            return response()->json([
                'message' => 'Cannot delete menu buttons that have children. Please delete children first.'
            ], 422);
        }

        $deleted = MenuButton::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => "Deleted {$deleted} menu buttons successfully"
        ]);
    }
}
