<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\MenuButton;
use App\Services\MenuButton\MenuButtonServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuButtonController extends Controller
{
    public function __construct(
        private MenuButtonServiceInterface $menuButtonService
    ) {}
    /**
     * Display a listing of menu buttons
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->get('status'),
            'button_type' => $request->get('button_type'),
            'parent_id' => $request->get('parent_id'),
            'search' => $request->get('search'),
        ];

        $perPage = (int) $request->get('per_page', 15);
        $menuButtons = $this->menuButtonService->getPaginated($filters, $perPage);

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

        $menuButton = $this->menuButtonService->create($validated);

        return response()->json($menuButton, 201);
    }

    /**
     * Display the specified menu button
     */
    public function show(MenuButton $menuButton): JsonResponse
    {
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

        $menuButton = $this->menuButtonService->update($menuButton, $validated);

        return response()->json($menuButton);
    }

    /**
     * Remove the specified menu button
     */
    public function destroy(MenuButton $menuButton): JsonResponse
    {
        try {
            $this->menuButtonService->delete($menuButton);
            
            return response()->json(['message' => 'Menu button deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Get menu button hierarchy (tree structure)
     */
    public function hierarchy(): JsonResponse
    {
        $rootButtons = $this->menuButtonService->getHierarchy();

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

        $result = $this->menuButtonService->bulkUpdate($validated['ids'], $validated['updates']);

        return response()->json($result);
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

        try {
            $result = $this->menuButtonService->bulkDelete($validated['ids']);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
