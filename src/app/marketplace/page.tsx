"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShieldCheck,
  Filter,
  ShoppingBag,
  MapPin,
  Star,
  ArrowRight,
  Loader2,
  Store,
  TrendingUp,
  Package
} from 'lucide-react';
import { KarigariLogo } from '@/components/ui/KarigariLogo';

const CATEGORIES = [
  'All',
  'Saree',
  'Pattachitra',
  'Terracotta',
  'Dhokra',
  'Pottery',
  'Bamboo',
  'Silk',
  'Embroidery'
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState<'shop' | 'b2b' | 'insights'>('shop');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error('Failed to fetch user', e);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const url = category === 'All' 
          ? '/api/marketplace/products' 
          : `/api/marketplace/products?category=${encodeURIComponent(category)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/marketplace" className="flex items-center flex-shrink-0">
            <KarigariLogo className="h-8 w-auto text-[#24332C]" />
          </Link>
          
          <div className="flex-1 max-w-2xl hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for authentic Indian handicrafts..." 
              className="bg-transparent border-none focus:ring-0 w-full ml-2 text-sm text-gray-900 placeholder-gray-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {user ? (
              <span className="text-sm font-medium text-gray-700">Hello, {user.name || 'Buyer'}</span>
            ) : (
              <Link href="/marketplace/login" className="text-sm font-medium text-white bg-[#24332C] hover:bg-[#14211B] px-4 py-2 rounded-md transition-colors">
                Login
              </Link>
            )}
            <button className="p-2 text-gray-600 hover:text-[#24332C] hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#24332C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Authentic Indian Handicrafts</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
            Discover and purchase directly from verified artisan clusters across India. Every piece tells a story.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setTab('shop')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${tab === 'shop' ? 'border-[#24332C] text-[#24332C]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Store className="w-4 h-4" /> Shop
            </button>
            <button 
              onClick={() => setTab('b2b')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${tab === 'b2b' ? 'border-[#24332C] text-[#24332C]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Package className="w-4 h-4" /> B2B Bulk Orders
            </button>
            <button 
              onClick={() => setTab('insights')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${tab === 'insights' ? 'border-[#24332C] text-[#24332C]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <TrendingUp className="w-4 h-4" /> Market Insights
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'b2b' && (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">B2B Bulk Orders</h2>
            <p className="text-gray-500 max-w-md mx-auto">Post bulk demand orders for artisan clusters. Connect directly with master artisans for large-scale requirements.</p>
            <button className="mt-6 bg-[#24332C] hover:bg-[#14211B] text-white px-6 py-2 rounded-md font-medium transition-colors">
              Post a Requirement
            </button>
          </div>
        )}

        {tab === 'insights' && (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Market Insights</h2>
            <p className="text-gray-500 max-w-md mx-auto">View real-time demand maps and trends. Understand what handicraft categories are trending globally.</p>
          </div>
        )}

        {tab === 'shop' && (
          <>
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
              <div className="flex items-center gap-1 text-gray-500 mr-2 flex-shrink-0">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === cat 
                      ? 'bg-[#24332C] text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#24332C] hover:text-[#24332C]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#24332C] animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading authentic crafts...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 text-lg">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                    <div className="relative aspect-square bg-gray-100 w-full overflow-hidden">
                      <Image
                        src={item.images && item.images.length > 0 ? item.images[0] : '/female_artisan.jpg'}
                        alt={item.craftType || 'Product Image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={item.images?.[0]?.startsWith('data:') || false}
                      />
                      {item.giTagApplied && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-900" />
                          GI Tagged
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-[#24332C] bg-green-50 px-2 py-1 rounded">
                          {item.craftType || 'Craft'}
                        </span>
                        <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-medium border border-green-100">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{item.title || item.craftType}</h3>
                      
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="line-clamp-1">{item.artisan?.name || 'Artisan'} • {item.artisan?.cluster || 'Cluster Location'}</span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 block">Price</span>
                          <span className="text-lg font-bold text-[#24332C]">
                            ?{item.askingPrice || item.standardMarketPrice || 'Contact'}
                          </span>
                        </div>
                        <Link 
                          href={`/marketplace/product/${item.id}`}
                          className="flex items-center gap-1 text-sm font-medium text-[#24332C] hover:text-[#14211B] bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded transition-colors"
                        >
                          View Details <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
