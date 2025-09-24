<?php

declare(strict_types=1);

namespace App\Repositories\BotTemplate;

use App\Models\BotTemplate;
use Illuminate\Database\Eloquent\Collection;

class BotTemplateRepository implements BotTemplateRepositoryInterface
{
    public function getAll(): Collection
    {
        return BotTemplate::orderBy('type')->orderBy('created_at', 'desc')->get();
    }

    public function getById(int $id): ?BotTemplate
    {
        return BotTemplate::find($id);
    }

    public function getByType(string $type): ?BotTemplate
    {
        return BotTemplate::active()->ofType($type)->first();
    }

    public function getActiveTemplates(): Collection
    {
        return BotTemplate::active()->orderBy('type')->get();
    }

    public function create(array $data): BotTemplate
    {
        // Deactivate existing template of the same type if this one is active
        if ($data['is_active'] ?? false) {
            BotTemplate::ofType($data['type'])->update(['is_active' => false]);
        }

        return BotTemplate::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $template = BotTemplate::find($id);
        if (!$template) {
            return false;
        }

        // If activating this template, deactivate others of the same type
        if ($data['is_active'] ?? false) {
            BotTemplate::where('type', $template->type)
                ->where('id', '!=', $id)
                ->update(['is_active' => false]);
        }

        return $template->update($data);
    }

    public function delete(int $id): bool
    {
        $template = BotTemplate::find($id);
        return $template ? $template->delete() : false;
    }

    public function activate(int $id): bool
    {
        $template = BotTemplate::find($id);
        if (!$template) {
            return false;
        }

        // Deactivate other templates of the same type
        BotTemplate::where('type', $template->type)
            ->where('id', '!=', $id)
            ->update(['is_active' => false]);

        return $template->update(['is_active' => true]);
    }

    public function deactivate(int $id): bool
    {
        $template = BotTemplate::find($id);
        return $template ? $template->update(['is_active' => false]) : false;
    }
}
