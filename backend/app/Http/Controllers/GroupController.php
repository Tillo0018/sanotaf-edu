<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    // Public endpoint for registration form
    public function openGroups()
    {
        return response()->json(Group::where('is_open', true)->get());
    }

    // Admin endpoints
    public function index()
    {
        return response()->json(Group::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:groups',
            'is_open' => 'boolean'
        ]);

        $group = Group::create([
            'name' => $validated['name'],
            'is_open' => $request->is_open ?? true
        ]);

        return response()->json($group, 201);
    }

    public function update(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:groups,name,' . $id,
            'is_open' => 'boolean'
        ]);

        $group->update($validated);

        return response()->json($group);
    }

    public function destroy($id)
    {
        $group = Group::findOrFail($id);
        $group->delete();

        return response()->json(['message' => 'Group deleted successfully']);
    }
}
