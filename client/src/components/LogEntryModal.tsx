import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchBox } from "@mapbox/search-js-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { vibeOptions } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { createLog } from "@/hooks/useLogs";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

// Helper to upload image to Supabase Storage
async function uploadImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const { data, error } = await supabase.storage.from('photos').upload(fileName, file);
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName);
  return publicUrlData?.publicUrl || null;
}

// Types
interface PlaceSuggestion {
  id: string;
  name: string;
  area: string;
  vibe?: string;
}

interface PhotoPreview {
  file: File;
  preview: string;
  id: string;
}

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const LogEntryModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [mapboxValue, setMapboxValue] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

  // 2. Form Handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 10 - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [
          ...prev,
          { file, preview: reader.result as string, id: crypto.randomUUID() },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlace) {
      toast({ title: "Please select a place", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photos if any
      let photo_url: string | null = null;
      if (photos.length > 0) {
        photo_url = await uploadImage(photos[0].file, user.id);
      }

      // Get user's display name and avatar from auth
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const authorName = userProfile?.display_name || 'User';
      const authorAvatar = userProfile?.avatar_url || '';
      const vibe = selectedVibes[0] || selectedPlace.vibe || 'cozy';
  const safePlaceId = isUuid(selectedPlace.id) ? selectedPlace.id : null;

      // Create log with correct schema
      await createLog({
        user_id: user.id,
        author_name: authorName,
        author_avatar: authorAvatar,
  place_id: safePlaceId,
        place_name: selectedPlace.name,
        area: selectedPlace.area,
        note: note,
        vibe: vibe,
        photo_url,
      });

      console.log('Log saved with user_id:', user.id)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['logs'] }),
        queryClient.invalidateQueries({ queryKey: ['logs', user.id] }),
      ]);

      toast({ title: "Success!", description: "Your FootNote has been saved." });
      
      // Reset form
      setSelectedPlace(null);
      setMapboxValue("");
      setRating(0);
      setNote("");
      setSelectedVibes([]);
      setPhotos([]);
      onOpenChange(false);
    } catch (err) {
      console.error("Submit error:", err);
      toast({ title: "Error", description: "Failed to save your log. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">Log a Visit</DialogTitle>
          <DialogDescription>Where did you go today?</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* SEARCH SECTION */}
          <div className="space-y-2">
            <Label>Find Place</Label>
            <SearchBox
              accessToken={mapboxToken}
              value={mapboxValue}
              onChange={(val) => setMapboxValue(val)}
              placeholder="Search for a cafe or park..."
              onRetrieve={(res) => {
                if (res.features && res.features.length > 0) {
                  const place = res.features[0] as any;
                  const rawId = place.id;
                  setSelectedPlace({
                    id: typeof rawId === 'string' ? rawId : '',
                    name: place.properties?.name || 'Unknown Place',
                    area: place.properties?.full_address || '',
                    vibe: 'cozy',
                  });
                  setMapboxValue(place.properties?.name || '');
                }
              }}
              theme={{
                variables: {
                  fontFamily: 'inherit',
                  unit: '14px',
                  borderRadius: '8px',
                  colorPrimary: 'hsl(var(--primary))',
                }
              }}
            />
            {selectedPlace && (
              <p className="text-xs text-primary">✓ {selectedPlace.name}</p>
            )}
          </div>

          {/* PHOTO SECTION */}
          <div className="space-y-2">
            <Label>Photos ({photos.length}/10)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((p) => (
                <div key={p.id} className="group relative h-16 w-16">
                  <img src={p.preview} className="h-full w-full rounded-md object-cover border" />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter(item => item.id !== p.id))}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-dashed border-muted hover:border-primary hover:bg-accent transition-all"
                >
                  <span className="text-2xl text-muted-foreground">+</span>
                </button>
              )}
            </div>
            <input type="file" hidden ref={fileInputRef} multiple onChange={handlePhotoSelect} accept="image/*" />
          </div>

          {/* VIBE & RATING */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={cn("text-xl transition-all", s <= rating ? "scale-110 text-yellow-500" : "text-muted-foreground/20")}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vibe</Label>
              <div className="flex flex-wrap gap-1">
                {vibeOptions.slice(0, 3).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVibes(prev => prev.includes(v) ? [] : [v])}
                    className={cn("rounded-full px-2 py-0.5 text-[10px] border transition-colors", 
                      selectedVibes.includes(v) ? "bg-primary text-white border-primary" : "bg-transparent text-muted-foreground")}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              placeholder="Tell us about your experience..." 
              className="resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full h-12" disabled={!selectedPlace || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Footnote"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};