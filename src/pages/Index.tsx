import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, MapPin, DollarSign, Home, Users, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-easyestate-pink font-bold text-xl">easyestate</div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-text-secondary hover:text-text-primary">How it works</a>
            <a href="#features" className="text-text-secondary hover:text-text-primary">Features</a>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center bg-easyestate-pink-light text-easyestate-pink px-4 py-2 rounded-full text-sm mb-8">
            <Shield className="w-4 h-4 mr-2" />
            Trusted by 10,000+ Buyers & Brokers
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Find your dream property,{" "}
            <span className="text-easyestate-pink">effortlessly</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with verified brokers who understand your needs. No more endless
            scrolling through irrelevant listings.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              className="bg-easyestate-pink hover:bg-easyestate-pink-dark text-white px-8 py-3 text-lg"
              onClick={() => navigate('/buyer-dashboard')}
            >
              Post Your Requirement →
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-3 text-lg border-text-secondary text-text-secondary hover:bg-bg-section"
              onClick={() => navigate('/broker-dashboard')}
            >
              I'm a Broker
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-easyestate-pink mb-2">10,000+</div>
              <div className="text-text-secondary">Happy Buyers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-easyestate-pink mb-2">5,000+</div>
              <div className="text-text-secondary">Verified Brokers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-easyestate-pink mb-2">50,000+</div>
              <div className="text-text-secondary">Properties Matched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-easyestate-pink mb-2">4.8</div>
              <div className="text-text-secondary">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-bg-section py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              How easyestate works
            </h2>
            <p className="text-xl text-text-secondary">Simple, transparent, and effective</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-easyestate-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-10 h-10 text-easyestate-pink" />
              </div>
              <div className="text-easyestate-pink font-semibold text-sm mb-2">STEP 01</div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Tell us what you need</h3>
              <p className="text-text-secondary leading-relaxed">
                Share your property requirements - location, budget, preferences, and timeline.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-easyestate-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-easyestate-pink" />
              </div>
              <div className="text-easyestate-pink font-semibold text-sm mb-2">STEP 02</div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Get matched with brokers</h3>
              <p className="text-text-secondary leading-relaxed">
                Our verified brokers review your requirement and connect if they can help.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-easyestate-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-easyestate-pink" />
              </div>
              <div className="text-easyestate-pink font-semibold text-sm mb-2">STEP 03</div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Find your perfect home</h3>
              <p className="text-text-secondary leading-relaxed">
                Work directly with matched brokers to view properties and close the deal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Why choose easyestate?
            </h2>
            <p className="text-xl text-text-secondary">Built for modern property seekers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <Card className="border border-border p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-easyestate-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-easyestate-pink" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Verified Brokers Only</h3>
              <p className="text-text-secondary leading-relaxed">
                All brokers go through our KYC process for your safety and peace of mind.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-border p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-easyestate-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-easyestate-pink" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Smart Matching</h3>
              <p className="text-text-secondary leading-relaxed">
                Our algorithm matches you with brokers who specialize in your requirements.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-border p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-easyestate-pink-light rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-easyestate-pink" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Transparent Pricing</h3>
              <p className="text-text-secondary leading-relaxed">
                No hidden fees. Brokers pay only when they successfully connect with buyers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-easyestate-pink py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to find your dream property?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of buyers who found their perfect home through easyestate
          </p>
          <Button 
            className="bg-white text-easyestate-pink hover:bg-white/90 px-8 py-3 text-lg font-semibold"
            onClick={() => navigate('/buyer-dashboard')}
          >
            Get Started Today →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-dark py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-easyestate-pink font-bold text-xl mb-4">easyestate</div>
              <p className="text-text-light mb-4">
                Making property search effortless for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-light hover:text-white">Post Requirement</a></li>
                <li><a href="#" className="text-text-light hover:text-white">How it Works</a></li>
                <li><a href="#" className="text-text-light hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">For Brokers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-light hover:text-white">Join Platform</a></li>
                <li><a href="#" className="text-text-light hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-text-light hover:text-white">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-light hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-text-light hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-text-light hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-text-light">© 2024 easyestate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;