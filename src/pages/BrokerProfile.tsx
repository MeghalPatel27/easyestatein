import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrokerProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/broker-dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  R
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Random Noob</h2>
                    <div className="flex items-center text-muted-foreground">
                      <div className="w-4 h-4 mr-2">📍</div>
                      <span>Location not specified</span>
                    </div>
                  </div>

                  {/* Profile Completeness */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg min-w-[250px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">%</span>
                      </div>
                      <span className="font-semibold">Profile Completeness Score</span>
                    </div>
                    <p className="text-sm opacity-90">
                      You are 100% away from Completing your profile, complete it now!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Details Tabs */}
          <Card className="p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal" className="text-primary font-medium">
                  Personal Details
                </TabsTrigger>
                <TabsTrigger value="property" className="text-muted-foreground">
                  Property Requirement
                </TabsTrigger>
                <TabsTrigger value="employment" className="text-muted-foreground">
                  Employment Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground font-medium">Random Noob</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p className="text-foreground font-medium">-</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-foreground font-medium">-</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Languages</label>
                      <p className="text-foreground font-medium">-</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <p className="text-foreground font-medium">91 9664978051</p>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          <Check className="w-3 h-3 mr-1" />
                          verified
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                      <p className="text-foreground font-medium">rnoob7989@gmail.com</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pin Code</label>
                      <p className="text-foreground font-medium">-</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="property" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Property requirement details would be displayed here.
                </div>
              </TabsContent>

              <TabsContent value="employment" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Employment details would be displayed here.
                </div>
              </TabsContent>
            </Tabs>

            {/* Edit Profile Button */}
            <div className="mt-8 pt-6 border-t">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
                EDIT PROFILE →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrokerProfile;