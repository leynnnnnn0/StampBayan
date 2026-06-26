<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CardTempalateController extends Controller
{
    public function index()
    {
        $cardTemplates = Auth::user()->business->loyaltyCards()
            ->with('perks')
            ->withCount(['stamp_codes as used_stamp_codes_count' => function ($q) {
                $q->whereNotNull('used_at');
            }])
            ->latest()
            ->get();



        return Inertia::render('Business/CardTemplate/Index', [
            'cardTemplates' => $cardTemplates
        ]);
    }

    public function show($id)
    {
        $cardTemplate = Auth::user()->business->loyaltyCards()
            ->with('perks')
            ->findOrFail($id);

        return Inertia::render('Business/CardTemplate/Show', [
            'cardTemplate' => $cardTemplate
        ]);
    }


    public function update(Request $request, $id)
    {
      
        $validated = $request->validate([
            'logo' => 'nullable|string',
            'name' => 'required|string|max:255|unique:loyalty_cards,name,' . $id . ',id,business_id,' . Auth::user()->business->id,
            'heading' => 'required|string|max:255',
            'subheading' => 'nullable|string|max:255',
            'valid_until' => 'required',
            'stampsNeeded' => 'required|integer|min:1',
            'mechanics' => 'required|string|max:500',
            'backgroundColor' => 'nullable|string|max:7',
            'textColor' => 'nullable|string|max:7',
            'stampColor' => 'nullable|string|max:7',
            'stampFilledColor' => 'nullable|string|max:7',
            'stampEmptyColor' => 'nullable|string|max:7',
            'stampImage' => 'nullable|string',
            'backgroundImage' => 'nullable|string',
            'footer' => 'nullable|string|max:255',
            'stampShape' => 'required|string|in:circle,square,star,hexagon,heart,diamond,triangle,oval',
            'perks' => 'nullable|array',
            'perks.*.id' => 'nullable|integer|exists:perks,id',
            'perks.*.stampNumber' => 'required_with:perks|integer|min:1',
            'perks.*.reward' => 'required_with:perks|string|max:255',
            'perks.*.color' => 'nullable|string|max:7',
            'perks.*.details' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            $loyaltyCard = Auth::user()->business->loyaltyCards()->findOrFail($id);

            // Handle Logo Upload
            $logoPath = $loyaltyCard->logo;
            if (!empty($validated['logo'])) {
                // Check if it's a new base64 image (not existing path)
                if ($validated['logo'] != "/" . $logoPath) {
                    // Delete old logo if exists
                    if ($logoPath && file_exists(public_path($logoPath))) {
                        unlink(public_path($logoPath));
                    }
                    $logoPath = $this->uploadBase64Image($validated['logo'], 'card-logos');
                } else {
                    // Keep existing logo path
                    $logoPath = $validated['logo'];
                }
            } elseif ($validated['logo'] === null) {
                // Logo was removed
                if ($logoPath && file_exists(public_path($logoPath))) {
                    unlink(public_path($logoPath));
                }
                $logoPath = null;
            }

            // Handle Stamp Image Upload
            $stampImagePath = $loyaltyCard->stampImage;
            if (!empty($validated['stampImage'])) {
                if ($validated['stampImage'] != "/" . $stampImagePath) {
                    if ($stampImagePath && file_exists(public_path($stampImagePath))) {
                        unlink(public_path($stampImagePath));
                    }
                    $stampImagePath = $this->uploadBase64Image($validated['stampImage'], 'stamp-images');
                }
            } elseif ($validated['stampImage'] === null) {
                if ($stampImagePath && file_exists(public_path($stampImagePath))) {
                    unlink(public_path($stampImagePath));
                }
                $stampImagePath = null;
            }

            // Handle Background Image Upload
            $backgroundImagePath = $loyaltyCard->backgroundImage;
            if (!empty($validated['backgroundImage'])) {
                if ($validated['backgroundImage'] != "/" . $backgroundImagePath) {
                    if ($backgroundImagePath && file_exists(public_path($backgroundImagePath))) {
                        unlink(public_path($backgroundImagePath));
                    }
                    $backgroundImagePath = $this->uploadBase64Image($validated['backgroundImage'], 'card-backgrounds');
                }
            } elseif ($validated['backgroundImage'] === null) {
                if ($backgroundImagePath && file_exists(public_path($backgroundImagePath))) {
                    unlink(public_path($backgroundImagePath));
                }
                $backgroundImagePath = null;
            }

            // Update loyalty card
            $loyaltyCard->update([
                'logo' => $logoPath,
                'name' => $validated['name'],
                'heading' => $validated['heading'],
                'subheading' => $validated['subheading'] ?? null,
                'stampsNeeded' => $validated['stampsNeeded'],
                'mechanics' => $validated['mechanics'],
                'valid_until' => $validated['valid_until'],
                'backgroundColor' => $validated['backgroundColor'] ?? '#FFFFFF',
                'textColor' => $validated['textColor'] ?? '#000000',
                'stampColor' => $validated['stampColor'] ?? '#FF0000',
                'stampFilledColor' => $validated['stampFilledColor'] ?? '#FF0000',
                'stampEmptyColor' => $validated['stampEmptyColor'] ?? '#CCCCCC',
                'stampImage' => $stampImagePath,
                'backgroundImage' => $backgroundImagePath,
                'footer' => $validated['footer'] ?? null,
                'stampShape' => $validated['stampShape'],
            ]);

            // Handle perks update
            if (isset($validated['perks'])) {
                $existingPerkIds = [];

                foreach ($validated['perks'] as $perkData) {
                    if (isset($perkData['id'])) {
                        // Update existing perk
                        $perk = $loyaltyCard->perks()->find($perkData['id']);
                        if ($perk) {
                            $perk->update([
                                'stampNumber' => $perkData['stampNumber'],
                                'reward' => $perkData['reward'],
                                'color' => $perkData['color'] ?? null,
                                'details' => $perkData['details'] ?? null,
                            ]);
                            $existingPerkIds[] = $perk->id;
                        }
                    } else {
                        // Create new perk
                        $newPerk = $loyaltyCard->perks()->create([
                            'stampNumber' => $perkData['stampNumber'],
                            'reward' => $perkData['reward'],
                            'color' => $perkData['color'] ?? null,
                            'details' => $perkData['details'] ?? null,
                        ]);
                        $existingPerkIds[] = $newPerk->id;
                    }
                }

                // Delete perks that were removed
                $loyaltyCard->perks()->whereNotIn('id', $existingPerkIds)->delete();
            } else {
                // Delete all perks if none provided
                $loyaltyCard->perks()->delete();
            }

            DB::commit();

            return redirect()->route('card-templates.index')->with('success', 'Card Template updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Card template update failed: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to update card template: ' . $e->getMessage()])->withInput();
        }
    }

    public function create()
    {
        return Inertia::render('Business/CardTemplate/Create');
    }

    public function edit($id)
    {
        $cardTemplate = Auth::user()->business->loyaltyCards()
            ->with('perks')
            ->findOrFail($id);

        return Inertia::render('Business/CardTemplate/Edit', [
            'cardTemplate' => $cardTemplate
        ]);
    }

    public function store(Request $request)
    {
        // if (Auth::user()->email === 'business@gmail.com') {
        //     return redirect()->back()->withErrors(['error' => 'Demo account cannot make changes.']);
        // }
        $validated = $request->validate([
            'logo' => 'nullable|string',
            'name' => 'required|string|max:255|unique:loyalty_cards,name,NULL,id,business_id,' . Auth::user()->business->id,
            'heading' => 'required|string|max:255',
            'subheading' => 'nullable|string|max:255',
            'valid_until' => 'required',
            'stampsNeeded' => 'required|integer|min:1',
            'mechanics' => 'required|string|max:500',
            'backgroundColor' => 'nullable|string|max:7',
            'textColor' => 'nullable|string|max:7',
            'stampColor' => 'nullable|string|max:7',
            'stampFilledColor' => 'nullable|string|max:7',
            'stampEmptyColor' => 'nullable|string|max:7',
            'stampImage' => 'nullable|string',
            'backgroundImage' => 'nullable|string',
            'footer' => 'nullable|string|max:255',
            'stampShape' => 'required|string|in:circle,square,star,hexagon,heart,diamond,triangle,oval',
            'perks' => 'nullable|array',
            'perks.*.stampNumber' => 'required_with:perks|integer|min:1',
            'perks.*.reward' => 'required_with:perks|string|max:255',
            'perks.*.color' => 'nullable|string|max:7',
            'perks.*.details' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            $business = Auth::user()->business;

            // Handle Logo Upload
            $logoPath = null;
            if (!empty($validated['logo'])) {
                $logoPath = $this->uploadBase64Image($validated['logo'], 'card-logos');
            }

            // Handle Stamp Image Upload
            $stampImagePath = null;
            if (!empty($validated['stampImage'])) {
                $stampImagePath = $this->uploadBase64Image($validated['stampImage'], 'stamp-images');
            }

            // Handle Background Image Upload
            $backgroundImagePath = null;
            if (!empty($validated['backgroundImage'])) {
                $backgroundImagePath = $this->uploadBase64Image($validated['backgroundImage'], 'card-backgrounds');
            }

            $loyaltyCard = $business->loyaltyCards()->create([
                'logo' => $logoPath,
                'name' => $validated['name'],
                'heading' => $validated['heading'],
                'subheading' => $validated['subheading'] ?? null,
                'stampsNeeded' => $validated['stampsNeeded'],
                'valid_until' => $validated['valid_until'],
                'mechanics' => $validated['mechanics'],
                'backgroundColor' => $validated['backgroundColor'] ?? '#FFFFFF',
                'textColor' => $validated['textColor'] ?? '#000000',
                'stampColor' => $validated['stampColor'] ?? '#FF0000',
                'stampFilledColor' => $validated['stampFilledColor'] ?? '#FF0000',
                'stampEmptyColor' => $validated['stampEmptyColor'] ?? '#CCCCCC',
                'stampImage' => $stampImagePath,
                'backgroundImage' => $backgroundImagePath,
                'footer' => $validated['footer'] ?? null,
                'stampShape' => $validated['stampShape'],
            ]);

            // Create perks if provided
            if (!empty($validated['perks'])) {
                $loyaltyCard->perks()->createMany($validated['perks']);
            }

            DB::commit();

            return redirect()->route('card-templates.index')->with('success', 'Card Template created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to create card template: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroy($id)
    {
        if (Auth::user()->email === 'business@gmail.com') {
            return redirect()->back()->withErrors(['error' => 'Demo account cannot make changes.']);
        }
        try {
            $loyaltyCard = Auth::user()->business->loyaltyCards()->findOrFail($id);

            if ($loyaltyCard->logo && file_exists(public_path($loyaltyCard->logo))) {
                unlink(public_path($loyaltyCard->logo));
            }
            if ($loyaltyCard->stampImage && file_exists(public_path($loyaltyCard->stampImage))) {
                unlink(public_path($loyaltyCard->stampImage));
            }
            if ($loyaltyCard->backgroundImage && file_exists(public_path($loyaltyCard->backgroundImage))) {
                unlink(public_path($loyaltyCard->backgroundImage));
            }

            $loyaltyCard->delete();

            return redirect()->route('card-templates.index')->with('success', 'Card Template deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Card template deletion failed: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to delete card template: ' . $e->getMessage()]);
        }
    }

    /**
     * Upload base64 image to public folder
     *
     * @param string $base64Image
     * @param string $folder
     * @return string|null
     */
    private function uploadBase64Image($base64Image, $folder)
    {
        try {
            // Check if the image is base64 encoded
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                // Get the image data
                $imageData = substr($base64Image, strpos($base64Image, ',') + 1);
                $imageData = base64_decode($imageData);

                if ($imageData === false) {
                    throw new \Exception('Base64 decode failed');
                }

                // Get image extension
                $extension = strtolower($type[1]); // jpg, png, gif, etc.

                // Validate image type
                if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    throw new \Exception('Invalid image type');
                }

                // Generate unique filename
                $filename = uniqid() . '_' . time() . '.' . $extension;

                // Create directory if it doesn't exist
                $directory = public_path($folder);
                if (!file_exists($directory)) {
                    mkdir($directory, 0755, true);
                }

                // Full path
                $filePath = $directory . '/' . $filename;

                // Save the image
                file_put_contents($filePath, $imageData);

                // Return the relative path for database storage
                return $folder . '/' . $filename;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Image upload failed: ' . $e->getMessage());
            return null;
        }
    }
}
