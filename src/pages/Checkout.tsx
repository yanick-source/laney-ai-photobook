import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { fetchProducts, ShopifyProduct, CartItem } from "@/lib/shopify";
import { getPhotobook } from "@/lib/photobookStorage";
import { 
  ChevronLeft, 
  ShoppingCart, 
  Loader2, 
  ExternalLink,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [photobookTitle, setPhotobookTitle] = useState<string>("Mijn Fotoboek");
  
  const { items, addItem, isLoading, createCheckout, checkoutUrl, clearCart } = useCartStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load photobook data
        const photobook = await getPhotobook();
        if (photobook) {
          setPhotobookTitle(photobook.title);
        }
        
        // Load products from Shopify
        const shopifyProducts = await fetchProducts(10, "product_type:Fotoboek");
        setProducts(shopifyProducts);
        
        // Select first variant by default
        if (shopifyProducts.length > 0 && shopifyProducts[0].node.variants.edges.length > 0) {
          setSelectedVariant(shopifyProducts[0].node.variants.edges[0].node.id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Kon producten niet laden");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    loadData();
  }, []);

  const handleAddToCart = () => {
    if (!selectedVariant || products.length === 0) return;
    
    const product = products[0];
    const variant = product.node.variants.edges.find(v => v.node.id === selectedVariant);
    
    if (!variant) return;
    
    const cartItem: CartItem = {
      product,
      variantId: variant.node.id,
      variantTitle: variant.node.title,
      price: variant.node.price,
      quantity: 1,
      selectedOptions: variant.node.selectedOptions,
    };
    
    addItem(cartItem);
    toast.success("Toegevoegd aan winkelwagen", {
      position: "top-center",
    });
  };

  const handleCheckout = async () => {
    try {
      await createCheckout();
      const url = useCartStore.getState().checkoutUrl;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Kon checkout niet starten");
    }
  };

  const product = products[0]?.node;
  const variants = product?.variants.edges || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  if (isLoadingProducts) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/editor")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Terug naar editor
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{totalItems} items</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground">Bestel je fotoboek</h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Product Selection */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                {photobookTitle}
              </h2>
              
              {product ? (
                <>
                  <p className="mb-6 text-muted-foreground">{product.description}</p>
                  
                  <div className="mb-6">
                    <label className="mb-3 block text-sm font-medium text-foreground">
                      Kies je formaat
                    </label>
                    <div className="space-y-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.node.id}
                          onClick={() => setSelectedVariant(variant.node.id)}
                          className={cn(
                            "w-full rounded-lg border-2 p-4 text-left transition-all",
                            selectedVariant === variant.node.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {selectedVariant === variant.node.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                              <span className="font-medium">{variant.node.title}</span>
                            </div>
                            <span className="font-bold text-foreground">
                              €{parseFloat(variant.node.price.amount).toFixed(2)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Toevoegen aan winkelwagen
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">Geen producten gevonden</p>
              )}
            </div>

            {/* Cart Summary */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Winkelwagen</h2>
              
              {items.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ShoppingCart className="mx-auto mb-4 h-12 w-12" />
                  <p>Je winkelwagen is leeg</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 space-y-4">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                        <div>
                          <p className="font-medium">{item.product.node.title}</p>
                          <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                          <p className="text-sm text-muted-foreground">Aantal: {item.quantity}</p>
                        </div>
                        <p className="font-bold">
                          €{(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-6 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Totaal</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading || items.length === 0}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checkout voorbereiden...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Afrekenen
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="mt-2 w-full"
                  >
                    Winkelwagen legen
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
