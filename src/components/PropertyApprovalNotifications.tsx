import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface PropertyApproval {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  approved_at?: string;
}

const PropertyApprovalNotifications = () => {
  const { user } = useAuth();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const { data: approvals = [], refetch } = useQuery({
    queryKey: ['property-approvals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('property_approvals')
        .select('id, title, status, admin_notes, submitted_at, approved_at')
        .eq('broker_id', user.id)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as PropertyApproval[];
    },
    enabled: !!user?.id,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const dismissNotification = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const visibleApprovals = approvals.filter(approval => 
    !dismissedIds.includes(approval.id)
  );

  if (visibleApprovals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Property Status Updates</h3>
      {visibleApprovals.map((approval) => (
        <Card key={approval.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(approval.status)}
                <h4 className="font-medium">{approval.title}</h4>
                <Badge className={getStatusColor(approval.status)} variant="outline">
                  {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                Submitted: {new Date(approval.submitted_at).toLocaleDateString()}
                {approval.approved_at && (
                  <span className="ml-3">
                    {approval.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(approval.approved_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {approval.status === 'approved' && (
                <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                  🎉 Great news! Your property has been approved and is now visible to potential buyers.
                </div>
              )}

              {approval.status === 'rejected' && (
                <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                  <p className="font-medium">❌ Your property submission was rejected.</p>
                  {approval.admin_notes && (
                    <p className="mt-1">Reason: {approval.admin_notes}</p>
                  )}
                  <p className="mt-1">Please review the feedback and resubmit with the necessary changes.</p>
                </div>
              )}

              {approval.status === 'pending' && (
                <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                  ⏳ Your property is currently under review. We'll notify you once it's processed.
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dismissNotification(approval.id)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PropertyApprovalNotifications;