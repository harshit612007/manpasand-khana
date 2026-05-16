import Link from 'next/link'
import Image from 'next/image'
import { Utensils, CheckCircle2, Truck, Leaf, ArrowRight, Soup, Salad, Dumbbell } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden min-h-screen flex flex-col">
      <header className="flex justify-between items-center w-full px-4 md:px-8 py-4 h-20 fixed top-0 left-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <Utensils className="text-primary w-8 h-8" />
          <h1 className="text-xl md:text-2xl font-extrabold text-primary">Manpasand Khana</h1>
        </div>
        <div className="hidden md:flex gap-4">
          <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors font-semibold py-2">
            Login
          </Link>
          <Link href="/signup" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold shadow-md hover:bg-primary/90 transition-all">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col relative pt-20">
        <div className="relative w-full h-auto md:h-[600px] flex flex-col md:flex-row items-center overflow-hidden">
          <div className="w-full md:w-1/2 px-4 md:px-12 pt-12 md:pt-0 z-10 flex flex-col justify-center">
            <div className="max-w-md mx-auto md:mx-0">
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                Ghar jaisa khana, roz naya
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Delicious home-cooked tiffins delivered to your doorstep. Experience the warmth of traditional recipes made with fresh, local ingredients every single day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-center shadow-lg active:scale-95 transition-all w-full sm:w-auto hover:bg-primary/90">
                  Get Started
                </Link>
                <Link href="/login" className="border-2 border-border text-foreground px-8 py-3 rounded-full font-semibold text-center hover:bg-muted transition-all w-full sm:w-auto">
                  Login to Account
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-[400px] md:h-full relative mt-12 md:mt-0">
            <div className="grid grid-cols-2 grid-rows-3 gap-2 h-full w-full p-2 md:p-6 opacity-80 md:opacity-100">
              <div className="row-span-2 col-span-1 rounded-2xl overflow-hidden shadow-lg">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIkUsZuyrS50SEZ20v5g1sGidf8_6soxhTbdo_DP0Bu8MSwsJpGINMSE9njDI4H1asguqGHJr8V1_5B0iap6fug5lXEkoK5CP-QfpYHZaVcQbghx44yBrS7tIGc7KsQDt3EDBPAJR3_BAjilJf2eSnokfMMFFXsuCaJlxX8hzFsBFUCNoNF6QV1NwFXTjk8pcuCWm81izGTrlNuyjwWxEGrh5ZZWnolSd1WhKy9kN68fEEZyFWU693DDErh9PLfEKaxu5CuCcr0HHO" 
                  alt="Indian Thali" 
                  width={500} height={500} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="row-span-1 col-span-1 rounded-2xl overflow-hidden shadow-lg">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4S05pjnHEQa4p2pCuZlMGzUxYY30qMIOR-AbPfCDztnjZLJ2crDsE9Kb_q05i4vh1j0Y7l31aJV-m5RvfFGLgYd75ByxWv3HxLj_xCoSl4lhXa0WOOHBu2_niPlzolgexgX_MzJJTOvfwkDuSk7CM4B0LWa7XondJh6JQD9RE0z5hekcqmkWiCLhZo-N-k783NdLVgb9nHtptQN6RlhwQ-DCyweE8vfsbsGL-lpPkidtjca4I8Ju-Knt2QA95BIPYz2_LoeEi6U6C" 
                  alt="Fresh Salad" 
                  width={500} height={250} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="row-span-2 col-span-1 rounded-2xl overflow-hidden shadow-lg">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGE_cnqv6bJ8GEFNvl6JA3zFq9bxvViInGU6R2crEKmwX45d39UWBYnbHryb-Jyiq4q1EnxefhCTeQShfq5SKDyl6Nqxxnv_acJS2DOXJfzBUBairR0Lx5H4uhgvDnPTrcqNzEQ20hsXwC8l_lllCrvj9xssgdHydbi1Qrk0RRHDgL_YBSsJutFj-mUjXJ-pubhPgAar1uhROVA1ad43PZfDwMzTXGvlfPEAZIDiJyWoRm8CSBTVWsmdB77XV_mVDEt2RPtakhzeRP" 
                  alt="Vegetable Curry" 
                  width={500} height={500} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
          </div>
        </div>

        <section className="px-4 md:px-8 py-12 bg-muted/50 border-y border-border">
          <div className="max-w-screen-xl mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-primary w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">FSSAI Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="text-primary w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Punctual Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="text-primary w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Eco-Friendly Tiffins</span>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 py-16 max-w-screen-xl mx-auto w-full">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-extrabold text-foreground mb-2">Curated Tiffins</h3>
            <p className="text-muted-foreground">Choose a plan that fits your lifestyle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all border border-border">
              <Leaf className="text-primary w-10 h-10" />
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">Shuddh Veg</h4>
                <p className="text-muted-foreground">Daily selection of pulses, seasonal greens, and whole-wheat rotis.</p>
              </div>
              <div className="mt-auto pt-4 flex justify-between items-center cursor-pointer group">
                <span className="font-semibold text-primary group-hover:underline">Explore Menu</span>
                <ArrowRight className="text-primary w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="bg-card p-8 rounded-2xl flex flex-col gap-4 border-2 border-primary shadow-lg relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-6 -right-10 bg-primary text-primary-foreground px-12 py-1 rotate-45 text-xs font-bold uppercase tracking-widest shadow-sm">Popular</div>
              <Soup className="text-primary w-10 h-10" />
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">Premium Thali</h4>
                <p className="text-muted-foreground">For the connoisseur. Includes dessert, raita, and premium sides.</p>
              </div>
              <div className="mt-auto pt-4 flex justify-between items-center cursor-pointer group">
                <span className="font-semibold text-primary group-hover:underline">Explore Menu</span>
                <ArrowRight className="text-primary w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="bg-card p-8 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all border border-border">
              <Dumbbell className="text-primary w-10 h-10" />
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">Health Hub</h4>
                <p className="text-muted-foreground">Calorie-counted, high protein, and low sodium options for the busy professional.</p>
              </div>
              <div className="mt-auto pt-4 flex justify-between items-center cursor-pointer group">
                <span className="font-semibold text-primary group-hover:underline">Explore Menu</span>
                <ArrowRight className="text-primary w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted px-4 md:px-8 py-8 mt-auto border-t border-border">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Utensils className="text-primary w-6 h-6" />
            <span className="text-lg font-extrabold text-primary">Manpasand Khana</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground text-center">© {new Date().getFullYear()} Manpasand Khana. Made with love for home-cooked food.</p>
        </div>
      </footer>
    </div>
  )
}
