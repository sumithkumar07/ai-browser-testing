// src/main/components/ShoppingAssistant.tsx
import React, { useState, useEffect } from 'react'
import { useAI } from '../hooks/useAI'
import { useAdvancedFeatures } from '../hooks/useAdvancedFeatures'

export interface Product {
  id: string
  name: string
  price: number
  currency: string
  image?: string
  url: string
  rating?: number
  reviewCount?: number
  availability: 'in-stock' | 'out-of-stock' | 'limited'
  seller: string
  features: string[]
  description: string
}

export interface PriceComparison {
  product: Product
  competitors: {
    seller: string
    price: number
    url: string
    availability: string
  }[]
  bestDeal: {
    seller: string
    price: number
    savings: number
    url: string
  }
}

export interface ReviewAnalysis {
  overallRating: number
  totalReviews: number
  sentiment: 'positive' | 'neutral' | 'negative'
  keyPoints: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  summary: string
}

const ShoppingAssistant: React.FC = () => {
  const { sendMessage, isLoading: aiLoading } = useAI()
  const { assignAgent } = useAdvancedFeatures()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null)
  const [reviewAnalysis, setReviewAnalysis] = useState<ReviewAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'compare' | 'reviews' | 'cart'>('search')

  const handleProductSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      setError(null)
      
      // Use AI agent for product search
      const context = {
        url: window.location.href,
        pageTitle: document.title,
        pageContent: document.body.innerText,
        userIntent: `Search for products: ${searchQuery}`,
        previousActions: [],
        sessionData: {}
      }

      const result = await assignAgent(`Search for products: ${searchQuery}`, context)
      
      if (result && result.success) {
        setProducts(result.products || [])
        if (result.products && result.products.length > 0) {
          setSelectedProduct(result.products[0])
        }
      } else {
        setError('Failed to search for products')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceComparison = async (product: Product) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const context = {
        url: product.url,
        pageTitle: product.name,
        pageContent: product.description,
        userIntent: `Compare prices for ${product.name}`,
        previousActions: [],
        sessionData: { product }
      }

      const result = await assignAgent(`Compare prices for ${product.name}`, context)
      
      if (result && result.success) {
        setPriceComparison(result.comparison)
        setActiveTab('compare')
      } else {
        setError('Failed to compare prices')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Price comparison failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewAnalysis = async (product: Product) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const context = {
        url: product.url,
        pageTitle: product.name,
        pageContent: product.description,
        userIntent: `Analyze reviews for ${product.name}`,
        previousActions: [],
        sessionData: { product }
      }

      const result = await assignAgent(`Analyze reviews for ${product.name}`, context)
      
      if (result && result.success) {
        setReviewAnalysis(result.analysis)
        setActiveTab('reviews')
      } else {
        setError('Failed to analyze reviews')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Review analysis failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    try {
      const result = await window.electronAPI.addToCart(product)
      
      if (result.success) {
        // Show success message
        setError(null)
        setActiveTab('cart')
      } else {
        setError(result.error || 'Failed to add to cart')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to cart')
    }
  }

  const handleGetCartContents = async () => {
    try {
      const result = await window.electronAPI.getCartContents()
      
      if (result.success) {
        return result.cart || []
      }
    } catch (error) {
      console.error('Failed to get cart contents:', error)
    }
    return []
  }

  const formatPrice = (price: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const renderStars = (rating: number): string => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
  }

  return (
    <div className="shopping-assistant">
      <div className="shopping-header">
        <h2>🛒 Shopping Assistant</h2>
        <div className="shopping-tabs">
          <button 
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            🔍 Search
          </button>
          <button 
            className={activeTab === 'compare' ? 'active' : ''}
            onClick={() => setActiveTab('compare')}
            disabled={!priceComparison}
          >
            💰 Compare
          </button>
          <button 
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
            disabled={!reviewAnalysis}
          >
            ⭐ Reviews
          </button>
          <button 
            className={activeTab === 'cart' ? 'active' : ''}
            onClick={() => setActiveTab('cart')}
          >
            🛒 Cart
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="shopping-content">
        {activeTab === 'search' && (
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleProductSearch()}
                className="search-input"
              />
              <button 
                onClick={handleProductSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="search-btn"
              >
                {isLoading ? '⏳' : '🔍'}
              </button>
            </div>

            {products.length > 0 && (
              <div className="products-grid">
                {products.map(product => (
                  <div 
                    key={product.id} 
                    className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.image && (
                      <img src={product.image} alt={product.name} className="product-image" />
                    )}
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">{formatPrice(product.price, product.currency)}</p>
                      <p className="product-seller">Sold by: {product.seller}</p>
                      {product.rating && (
                        <div className="product-rating">
                          <span className="stars">{renderStars(product.rating)}</span>
                          <span className="rating-text">({product.reviewCount} reviews)</span>
                        </div>
                      )}
                      <div className={`availability ${product.availability}`}>
                        {product.availability === 'in-stock' ? '✅ In Stock' : 
                         product.availability === 'limited' ? '⚠️ Limited Stock' : '❌ Out of Stock'}
                      </div>
                    </div>
                    <div className="product-actions">
                      <button 
                        onClick={() => handlePriceComparison(product)}
                        className="action-btn compare"
                        disabled={isLoading}
                      >
                        💰 Compare Prices
                      </button>
                      <button 
                        onClick={() => handleReviewAnalysis(product)}
                        className="action-btn reviews"
                        disabled={isLoading}
                      >
                        ⭐ Analyze Reviews
                      </button>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="action-btn add-cart"
                        disabled={isLoading || product.availability === 'out-of-stock'}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {products.length === 0 && !isLoading && (
              <div className="empty-state">
                <p>Search for products to get started!</p>
                <p>Try searching for items like "laptop", "smartphone", or "headphones"</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compare' && priceComparison && (
          <div className="compare-section">
            <h3>Price Comparison for {priceComparison.product.name}</h3>
            
            <div className="best-deal">
              <h4>🏆 Best Deal</h4>
              <div className="deal-card">
                <p><strong>{priceComparison.bestDeal.seller}</strong></p>
                <p className="price">{formatPrice(priceComparison.bestDeal.price)}</p>
                <p className="savings">Save {formatPrice(priceComparison.bestDeal.savings)}</p>
                <button onClick={() => window.open(priceComparison.bestDeal.url)}>
                  View Deal
                </button>
              </div>
            </div>

            <div className="competitors">
              <h4>All Prices</h4>
              <div className="competitors-list">
                {priceComparison.competitors.map((competitor, index) => (
                  <div key={index} className="competitor-card">
                    <p><strong>{competitor.seller}</strong></p>
                    <p className="price">{formatPrice(competitor.price)}</p>
                    <p className="availability">{competitor.availability}</p>
                    <button onClick={() => window.open(competitor.url)}>
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && reviewAnalysis && (
          <div className="reviews-section">
            <h3>Review Analysis</h3>
            
            <div className="review-summary">
              <div className="overall-rating">
                <span className="rating-number">{reviewAnalysis.overallRating}</span>
                <span className="rating-stars">{renderStars(reviewAnalysis.overallRating)}</span>
                <span className="total-reviews">({reviewAnalysis.totalReviews} reviews)</span>
              </div>
              <p className="sentiment">Sentiment: {reviewAnalysis.sentiment}</p>
              <p className="summary">{reviewAnalysis.summary}</p>
            </div>

            <div className="key-points">
              <div className="positive-points">
                <h4>✅ Positive Points</h4>
                <ul>
                  {reviewAnalysis.keyPoints.positive.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              
              <div className="negative-points">
                <h4>❌ Negative Points</h4>
                <ul>
                  {reviewAnalysis.keyPoints.negative.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-section">
            <h3>Shopping Cart</h3>
            <p>Cart functionality will be implemented here</p>
            <p>This will include:</p>
            <ul>
              <li>View cart contents</li>
              <li>Update quantities</li>
              <li>Remove items</li>
              <li>Calculate totals</li>
              <li>Proceed to checkout</li>
            </ul>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  )
}

export default ShoppingAssistant
