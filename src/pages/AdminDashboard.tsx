import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, Phone, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  customerId: string;
  sellerId: string;
  items: any;
  total: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: any;
  createdAt: string;
  contactAttempts: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<"seller_accept" | "seller_reject" | "buyer_confirm" | "buyer_reject" | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleContactSeller = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "seller_contacted",
          contactAttempts: order.contactAttempts + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }

      toast({ title: "Success", description: "Seller contacted status updated" });
      fetchPendingOrders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSellerResponse = async (accepted: boolean) => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: accepted ? "seller_accepted" : "seller_rejected",
          sellerResponse: note,
          rejectReason: accepted ? null : note,
          note,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }

      toast({
        title: "Success",
        description: `Seller ${accepted ? "accepted" : "rejected"} the order`,
      });
      setActionDialogOpen(false);
      setNote("");
      fetchPendingOrders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleContactBuyer = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "buyer_contacted",
          contactAttempts: order.contactAttempts + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }

      toast({ title: "Success", description: "Buyer contacted status updated" });
      fetchPendingOrders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBuyerResponse = async (confirmed: boolean) => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: confirmed ? "confirmed" : "buyer_rejected",
          buyerResponse: note,
          rejectReason: confirmed ? null : note,
          note,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }

      toast({
        title: "Success",
        description: `Order ${confirmed ? "confirmed" : "cancelled"}`,
      });
      setActionDialogOpen(false);
      setNote("");
      fetchPendingOrders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const openActionDialog = (order: Order, actionType: typeof action) => {
    setSelectedOrder(order);
    setAction(actionType);
    setActionDialogOpen(true);
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/analytics")} data-testid="button-analytics">
                Analytics
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/users")} data-testid="button-users">
                Users
              </Button>
              <Button variant="outline" onClick={handleSignOut} data-testid="button-signout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Order Verification Queue</h2>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No pending orders</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                    <Badge>{formatStatus(order.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Order Details</h4>
                      <div className="space-y-1 text-sm">
                        <div>Total: ₹{parseFloat(order.total).toFixed(2)}</div>
                        <div>Payment: {order.paymentMethod.toUpperCase()}</div>
                        <div>Payment Status: {order.paymentStatus.replace(/_/g, " ")}</div>
                        <div>Contact Attempts: {order.contactAttempts}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Items</h4>
                      <div className="space-y-1 text-sm">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx}>
                            {item.title} × {item.quantity} = ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.status === "pending_verification" && (
                        <Button
                          size="sm"
                          onClick={() => handleContactSeller(order.id)}
                          className="gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Contact Seller
                        </Button>
                      )}
                      {order.status === "seller_contacted" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => openActionDialog(order, "seller_accept")}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Seller Accepted
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openActionDialog(order, "seller_reject")}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Seller Rejected
                          </Button>
                        </>
                      )}
                      {order.status === "seller_accepted" && (
                        <Button
                          size="sm"
                          onClick={() => handleContactBuyer(order.id)}
                          className="gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Contact Buyer
                        </Button>
                      )}
                      {order.status === "buyer_contacted" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => openActionDialog(order, "buyer_confirm")}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Buyer Confirmed
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openActionDialog(order, "buyer_reject")}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Buyer Cancelled
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "seller_accept" && "Confirm Seller Acceptance"}
              {action === "seller_reject" && "Confirm Seller Rejection"}
              {action === "buyer_confirm" && "Confirm Buyer Order"}
              {action === "buyer_reject" && "Cancel Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Note / Reason</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any relevant notes..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setActionDialogOpen(false);
                  setNote("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (action === "seller_accept") handleSellerResponse(true);
                  if (action === "seller_reject") handleSellerResponse(false);
                  if (action === "buyer_confirm") handleBuyerResponse(true);
                  if (action === "buyer_reject") handleBuyerResponse(false);
                }}
                className="flex-1"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
