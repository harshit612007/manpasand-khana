import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { revalidatePath } from 'next/cache'
import { Star } from 'lucide-react'

// Server Action for adding review
async function addReview(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const menuId = formData.get('menu_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string

  if (!rating || rating < 1 || rating > 5) throw new Error("Invalid rating")

  const { error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      menu_id: menuId,
      rating,
      comment
    })

  if (error) throw error
  revalidatePath('/reviews')
}

export default async function CustomerReviews() {
  const supabase = await createClient()

  // Get today's menu to allow rating it
  const today = new Date().toISOString().split('T')[0]
  const { data: menu } = await supabase
    .from('menus')
    .select('id, item_name')
    .eq('date', today)
    .single()

  // Get recent reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, menus(item_name), profiles(name)')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Reviews & Ratings</h1>
        <p className="text-muted-foreground">See what others are saying and share your thoughts.</p>
      </div>

      {menu && (
        <Card className="border-primary/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Rate Today's Meal: {menu.item_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addReview} className="space-y-4">
              <input type="hidden" name="menu_id" value={menu.id} />
              
              <div className="space-y-2">
                <label className="text-sm font-semibold">Your Rating (1-5)</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(num => (
                    <label key={num} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <input type="radio" name="rating" value={num} required className="sr-only peer" />
                      <div className="p-2 rounded-full border border-border peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground text-muted-foreground transition-all hover:bg-muted">
                        <Star className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold">{num}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-semibold">Comments (Optional)</label>
                <textarea 
                  id="comment" 
                  name="comment" 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="How was the food?"
                />
              </div>

              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors">
                Submit Review
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold text-foreground mb-4">Recent Reviews</h3>
        
        {reviews && reviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review: any) => (
              <Card key={review.id} className="border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm text-foreground">{review.profiles?.name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{review.menus?.item_name}</p>
                    </div>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted/30'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2 italic bg-muted/50 p-2 rounded-md">
                      "{review.comment}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet.</p>
        )}
      </div>
    </div>
  )
}
