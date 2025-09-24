<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\BotTemplate\BotTemplateServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BotTemplateController extends Controller
{
    public function __construct(
        private BotTemplateServiceInterface $botTemplateService
    ) {}

    public function index(): JsonResponse
    {
        $templates = $this->botTemplateService->getAllTemplates();
        $types = $this->botTemplateService->getAvailableTypes();
        
        return response()->json([
            'success' => true,
            'data' => [
                'templates' => $templates,
                'types' => $types,
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:' . implode(',', array_keys($this->botTemplateService->getAvailableTypes())),
            'content' => 'required|string',
            'is_active' => 'boolean',
            'variables' => 'nullable|array',
        ]);

        $template = $this->botTemplateService->createTemplate($validated);

        return response()->json([
            'success' => true,
            'data' => $template,
            'message' => 'Template created successfully'
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $template = $this->botTemplateService->getTemplateById($id);
        
        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $template
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'variables' => 'nullable|array',
        ]);

        $success = $this->botTemplateService->updateTemplate($id, $validated);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully'
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $success = $this->botTemplateService->deleteTemplate($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully'
        ]);
    }

    public function activate(int $id): JsonResponse
    {
        $success = $this->botTemplateService->activateTemplate($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Template activated successfully'
        ]);
    }

    public function deactivate(int $id): JsonResponse
    {
        $success = $this->botTemplateService->deactivateTemplate($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Template deactivated successfully'
        ]);
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:' . implode(',', array_keys($this->botTemplateService->getAvailableTypes())),
            'content' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        // Create a temporary template instance to process content
        $template = new \App\Models\BotTemplate([
            'content' => $validated['content'],
            'variables' => $validated['variables'] ?? []
        ]);

        $processedContent = $template->processContent($validated['variables'] ?? []);

        return response()->json([
            'success' => true,
            'data' => [
                'original_content' => $validated['content'],
                'processed_content' => $processedContent,
                'variables_used' => $validated['variables'] ?? []
            ]
        ]);
    }
}
