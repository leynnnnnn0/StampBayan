<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\PrizeWheel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class PrizeWheelController extends Controller
{
    public function index()
    {
        $wheel = Auth::user()->business->prizeWheel()
            ->with('prizes')
            ->first();

        return Inertia::render('Business/PrizeWheel/Index', [
            'wheel' => $wheel,
            'feedback' => DB::table('prize_wheel_feedback')->where('user_id', Auth::id())->first(['liked', 'remarks']),
        ]);
    }

    public function feedback(Request $request)
    {
        abort_unless(Auth::user()->business, 403);
        $validated = $request->validate([
            'liked' => ['required', 'boolean'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::table('prize_wheel_feedback')->upsert([
            'user_id' => Auth::id(),
            'liked' => $validated['liked'],
            'remarks' => $validated['remarks'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ], ['user_id'], ['liked', 'remarks', 'updated_at']);

        return back()->with('success', 'Thank you for your Prize Wheel feedback.');
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:240'],
            'is_active' => ['required', 'boolean'],
            'prizes' => ['required', 'array', 'min:2', 'max:12'],
            'prizes.*.id' => ['nullable', 'integer'],
            'prizes.*.name' => ['required', 'string', 'max:60'],
            'prizes.*.probability' => ['required', 'numeric', 'gt:0', 'max:100'],
            'prizes.*.color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'prizes.*.image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:3072'],
            'prizes.*.remove_image' => ['nullable', 'boolean'],
        ]);

        $totalProbability = collect($validated['prizes'])->sum(
            fn (array $prize) => (float) $prize['probability']
        );

        if (abs($totalProbability - 100) > 0.001) {
            throw ValidationException::withMessages([
                'prizes' => 'Prize percentages must add up to exactly 100%.',
            ]);
        }

        $business = Auth::user()->business;
        $wheel = $business->prizeWheel()->with('prizes')->first();
        $existingPrizes = $wheel?->prizes->keyBy('id') ?? collect();

        foreach ($validated['prizes'] as $prize) {
            if (! empty($prize['id']) && ! $existingPrizes->has((int) $prize['id'])) {
                throw ValidationException::withMessages([
                    'prizes' => 'One of the selected prizes does not belong to this business.',
                ]);
            }
        }

        $newImagePaths = [];
        $oldImagePaths = [];

        try {
            DB::transaction(function () use (
                $request,
                $validated,
                $business,
                $wheel,
                $existingPrizes,
                &$newImagePaths,
                &$oldImagePaths
            ) {
                $wheel = PrizeWheel::updateOrCreate(
                    ['business_id' => $business->id],
                    [
                        'title' => $validated['title'],
                        'description' => $validated['description'] ?? null,
                        'is_active' => $validated['is_active'],
                    ]
                );

                $savedPrizeIds = [];

                foreach ($validated['prizes'] as $index => $prizeData) {
                    $prize = ! empty($prizeData['id'])
                        ? $existingPrizes->get((int) $prizeData['id'])
                        : $wheel->prizes()->make();

                    $imagePath = $prize?->image_path;

                    if ($request->hasFile("prizes.{$index}.image")) {
                        if ($imagePath) {
                            $oldImagePaths[] = $imagePath;
                        }

                        $imagePath = $this->storeImage($request->file("prizes.{$index}.image"));
                        $newImagePaths[] = $imagePath;
                    } elseif (($prizeData['remove_image'] ?? false) && $imagePath) {
                        $oldImagePaths[] = $imagePath;
                        $imagePath = null;
                    }

                    $prize->fill([
                        'name' => $prizeData['name'],
                        'image_path' => $imagePath,
                        'probability' => $prizeData['probability'],
                        'color' => strtoupper($prizeData['color']),
                        'sort_order' => $index,
                    ]);
                    $prize->save();
                    $savedPrizeIds[] = $prize->id;
                }

                $wheel->prizes()
                    ->whereNotIn('id', $savedPrizeIds)
                    ->get()
                    ->each(function ($prize) use (&$oldImagePaths) {
                        if ($prize->image_path) {
                            $oldImagePaths[] = $prize->image_path;
                        }
                        $prize->delete();
                    });
            });
        } catch (Throwable $exception) {
            collect($newImagePaths)->each(fn (string $path) => $this->deleteImage($path));
            throw $exception;
        }

        collect($oldImagePaths)->unique()->each(fn (string $path) => $this->deleteImage($path));

        return back()->with('success', 'Prize Wheel settings saved successfully.');
    }

    private function storeImage($file): string
    {
        $directory = public_path('uploads/prize-wheel');
        File::ensureDirectoryExists($directory);

        $filename = Str::uuid().'.'.$file->extension();
        $file->move($directory, $filename);

        return 'uploads/prize-wheel/'.$filename;
    }

    private function deleteImage(string $path): void
    {
        $fullPath = public_path($path);

        if (File::isFile($fullPath)) {
            File::delete($fullPath);
        }
    }
}
