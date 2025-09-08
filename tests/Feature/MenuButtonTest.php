<?php

use App\Models\MenuButton;
use App\Models\User;

test('can get menu buttons list', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    // Create some test menu buttons
    MenuButton::factory()->count(3)->create();

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/menu-buttons');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'status',
                    'sort',
                    'parent_id',
                    'created_at',
                    'updated_at',
                ]
            ],
            'current_page',
            'last_page',
            'per_page',
            'total',
        ]);
});

test('can create menu button', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $menuButtonData = [
        'name' => 'Test Menu Button',
        'status' => 1,
        'sort' => 1,
        'enable_template' => true,
        'template_content' => 'Test template content',
    ];

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson('/api/menu-buttons', $menuButtonData);

    $response->assertStatus(201)
        ->assertJson([
            'name' => 'Test Menu Button',
            'status' => 1,
            'sort' => 1,
            'enable_template' => true,
            'template_content' => 'Test template content',
        ]);

    $this->assertDatabaseHas('menu_buttons', [
        'name' => 'Test Menu Button',
        'status' => 1,
    ]);
});

test('can update menu button', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $menuButton = MenuButton::factory()->create([
        'name' => 'Original Name',
        'status' => 1,
    ]);

    $updateData = [
        'name' => 'Updated Name',
        'status' => 0,
    ];

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->putJson("/api/menu-buttons/{$menuButton->id}", $updateData);

    $response->assertStatus(200)
        ->assertJson([
            'name' => 'Updated Name',
            'status' => 0,
        ]);

    $this->assertDatabaseHas('menu_buttons', [
        'id' => $menuButton->id,
        'name' => 'Updated Name',
        'status' => 0,
    ]);
});

test('can delete menu button', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $menuButton = MenuButton::factory()->create();

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->deleteJson("/api/menu-buttons/{$menuButton->id}");

    $response->assertStatus(200)
        ->assertJson(['message' => 'Menu button deleted successfully']);

    $this->assertDatabaseMissing('menu_buttons', [
        'id' => $menuButton->id,
    ]);
});

test('can get menu button hierarchy', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    // Create a parent menu button
    $parent = MenuButton::factory()->create([
        'name' => 'Parent Menu',
        'parent_id' => null,
        'status' => 1,
    ]);

    // Create child menu buttons
    MenuButton::factory()->count(2)->create([
        'parent_id' => $parent->id,
        'status' => 1,
    ]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/menu-buttons-hierarchy');

    $response->assertStatus(200)
        ->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'children' => [
                    '*' => [
                        'id',
                        'name',
                        'parent_id',
                    ]
                ]
            ]
        ]);
});
