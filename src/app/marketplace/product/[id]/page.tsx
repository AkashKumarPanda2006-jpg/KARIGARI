'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: summary, 1: payment, 2: success
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/marketplace/products?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleCheckout = () => {
    setShowCheckout(true);
    setCheckoutStep(0);
  };

  const proceedToPayment = () => {
    setCheckoutStep(1);
    
    // Simulate payment delay
    setTimeout(async () => {
      try {
        const res = await fetch('/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            craftItemId: id,
            quantity: 1,
            totalPrice: product.askingPrice,
            paymentMethod: 'UPI_SIMULATED'
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setOrderInfo(data);
          setCheckoutStep(2);
        } else {
          alert('Failed to place order.');
          setShowCheckout(false);
        }
      } catch (err) {
        console.error(err);
        alert('Payment error.');
        setShowCheckout(false);
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-[#24332C] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/marketplace')}
          className="flex items-center text-sm text-gray-500 hover:text-[#24332C] mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Marketplace
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 flex flex-col gap-4 bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`}
                    alt={`Product ${idx}`}
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No images</span>
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-8 flex flex-col">
            <span className="text-sm font-semibold text-[#24332C] uppercase tracking-wider mb-2">
              {product.craftType}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.title || 'Artisan Craft Item'}
            </h1>
            <p className="text-gray-500 mb-6">
              By <span className="font-medium text-gray-900">{product.artisanName || 'Artisan'}</span> • {product.cluster || 'India'}
            </p>

            <div className="mb-6 p-4 bg-[#f4f7f5] rounded-lg border border-[#e1e9e5]">
              <div className="flex items-start">
                <ShieldCheck className="h-6 w-6 text-[#24332C] mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Fair Wage Guarantee</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    This artisan receives {product.artisanSharePercentage || 85}% of the sale price directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-end mb-6">
              <span className="text-4xl font-extrabold text-gray-900">?{product.askingPrice}</span>
              {product.standardMarketPrice && (
                <span className="ml-3 text-lg text-gray-500 line-through mb-1">
                  Market Value: ?{product.standardMarketPrice}
                </span>
              )}
            </div>

            <div className="prose prose-sm text-gray-700 mb-8 flex-grow">
              <h4 className="font-semibold text-gray-900">Description</h4>
              <p>{product.descriptionEnglish || product.description}</p>
              
              {product.descriptionOriginal && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-2">Original Transcript</h4>
                  <p className="italic text-gray-600">{product.descriptionOriginal}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#24332C] hover:bg-[#14211B] text-white py-4 rounded-lg font-bold text-lg shadow-md transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-[#24332C] text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Checkout</h3>
              {checkoutStep < 2 && (
                <button onClick={() => setShowCheckout(false)} className="text-gray-300 hover:text-white">?</button>
              )}
            </div>
            
            <div className="p-6">
              {checkoutStep === 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold border-b pb-2">Order Summary</h4>
                  <div className="flex justify-between py-2">
                    <span>{product.title || 'Artisan Craft Item'} (x1)</span>
                    <span className="font-medium">?{product.askingPrice}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t font-bold">
                    <span>Total</span>
                    <span>?{product.askingPrice}</span>
                  </div>
                  <button
                    onClick={proceedToPayment}
                    className="w-full bg-[#24332C] text-white py-3 rounded-lg font-semibold mt-4"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}

              {checkoutStep === 1 && (
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-xl">
                    <span className="text-gray-400 text-center text-sm px-4">
                      Scan to Pay ?{product.askingPrice}<br/><br/>
                      <span className="font-mono bg-gray-200 px-2 py-1 rounded">karigari@upi</span>
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Waiting for payment...
                  </div>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                  <h3 className="text-2xl font-bold text-gray-900">Payment Successful! ?</h3>
                  
                  {orderInfo?.patchId && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                      <p className="text-sm text-green-800 mb-2 font-medium">Digital Patch Created</p>
                      <p className="text-xs text-green-700 break-all mb-3 bg-white p-2 rounded border border-green-100">
                        {orderInfo.patchId}
                      </p>
                      <Link
                        href={`/verify/${orderInfo.patchId}`}
                        className="text-sm font-semibold text-[#24332C] hover:underline"
                      >
                        Scan QR on your product to verify authenticity at /verify/{orderInfo.patchId}
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      router.push('/marketplace');
                    }}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium mt-4 hover:bg-gray-50"
                  >
                    Return to Marketplace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
