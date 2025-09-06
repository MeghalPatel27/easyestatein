import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Unlock, 
  Eye, 
  Phone, 
  Mail, 
  MessageSquare,
  Clock,
  TrendingUp,
  Shield
} from "lucide-react";

const LeadDetails = () => {
  const { leadId } = useParams();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [note, setNote] = useState("");

  // Mock lead data
  const lead = {
    id: leadId,
    rating: 4.8,
    type: "Residential",
    area: "Mumbai Central",
    budget: "₹2.5-3.5 Cr",
    urgency: "High",
    rejectionRate: 15,
    leadPrice: 50,
    verified: true,
    trending: "up",
    requirements: {
      bedrooms: "3-4 BHK",
      bathrooms: "3-4",
      area: "1200-1800 sq ft",
      floor: "Above 5th floor",
      amenities: ["Parking", "Gym", "Swimming Pool", "Security"],
      possession: "Ready to move or under construction"
    },
    anonymizedInfo: {
      profession: "IT Professional",
      ageGroup: "30-35 years",
      familySize: "4 members",
      currentLocation: "Mumbai Central area",
      timeframe: "3-6 months"
    },
    contactInfo: {
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      email: "rahul.sharma@example.com",
      whatsapp: "+91 98765 43210"
    },
    leadHistory: [
      { date: "2024-01-15", action: "Lead Generated", details: "Interested in 3-4 BHK in Mumbai Central" },
      { date: "2024-01-18", action: "Property Submitted", details: "3 BHK submitted by Broker ABC" },
      { date: "2024-01-20", action: "Lead Viewed", details: "Contact details unlocked" },
      { date: "2024-01-22", action: "Follow-up", details: "Scheduled site visit" }
    ]
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleUnlockContact = () => {
    setIsUnlocked(true);
    // Here you would deduct coins and make API call
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/broker/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Lead Details</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{lead.rating}</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <Badge className={getUrgencyColor(lead.urgency)}>
              {lead.urgency} Priority
            </Badge>
            {lead.verified && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            {isUnlocked ? "Contact Unlocked" : "View Only"}
          </Button>
          {!isUnlocked && (
            <Button onClick={handleUnlockContact} className="gap-2 bg-orange-500 hover:bg-orange-600">
              <Unlock className="h-4 w-4" />
              Unlock for {lead.leadPrice} coins
            </Button>
          )}
        </div>
      </div>

      {/* Lead Summary Card */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Property Type</p>
            <p className="font-semibold">{lead.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <p className="font-semibold">{lead.area}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Budget Range</p>
            <p className="font-semibold text-primary">{lead.budget}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rejection Rate</p>
            <p className="font-semibold text-red-600">{lead.rejectionRate}%</p>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requirements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="buyer-info">Buyer Info</TabsTrigger>
          <TabsTrigger value="contact" disabled={!isUnlocked}>
            {isUnlocked ? "Contact Details" : "🔒 Contact"}
          </TabsTrigger>
          <TabsTrigger value="history">Lead History</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Property Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Configuration</p>
                <p className="font-medium">{lead.requirements.bedrooms}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bathrooms</p>
                <p className="font-medium">{lead.requirements.bathrooms}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carpet Area</p>
                <p className="font-medium">{lead.requirements.area}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Floor Preference</p>
                <p className="font-medium">{lead.requirements.floor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Possession</p>
                <p className="font-medium">{lead.requirements.possession}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Must-have Amenities</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {lead.requirements.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="buyer-info" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Anonymized Buyer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Profession</p>
                <p className="font-medium">{lead.anonymizedInfo.profession}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age Group</p>
                <p className="font-medium">{lead.anonymizedInfo.ageGroup}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Family Size</p>
                <p className="font-medium">{lead.anonymizedInfo.familySize}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Location</p>
                <p className="font-medium">{lead.anonymizedInfo.currentLocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Decision Timeframe</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="font-medium">{lead.anonymizedInfo.timeframe}</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          {isUnlocked ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{lead.contactInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <p className="font-medium">{lead.contactInfo.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">{lead.contactInfo.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <p className="font-medium">{lead.contactInfo.whatsapp}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call Now
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="mb-4">
                <Unlock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Contact Details Locked</h3>
                <p className="text-muted-foreground">Unlock contact details for {lead.leadPrice} coins</p>
              </div>
              <Button onClick={handleUnlockContact} className="gap-2 bg-orange-500 hover:bg-orange-600">
                <Unlock className="h-4 w-4" />
                Unlock for {lead.leadPrice} coins
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Lead Activity History</h3>
            <div className="space-y-4">
              {lead.leadHistory.map((item, index) => (
                <div key={index} className="flex items-start gap-4 border-l-2 border-muted pl-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{item.action}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">My Notes</h3>
            <Textarea
              placeholder="Add notes about this lead..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mb-4"
            />
            <Button>Save Note</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadDetails;