import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, LogOut, TrendingUp, ShoppingBag, Users, DollarSign, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalSellers: number;
  recentOrders: Array<{
    id: string;
    customerId: string;
    total: string;
    status: string;
    createdAt: string;
  }>;
  topSellers: Array<{
    sellerId: string;
    shopName: string;
    orderCount: number;
    revenue: string;
  }>;
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // If endpoint doesn't exist, create mock data for display
        const mockData: AnalyticsData = {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          totalSellers: 0,
          recentOrders: [],
          topSellers: [],
        };
        setAnalytics(mockData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold" data-testid="text-title">Admin Analytics</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            data-testid="button-signout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card data-testid="card-total-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-orders">
                {analytics?.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.pendingOrders || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                ₹{analytics?.totalRevenue.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.completedOrders || 0} completed orders
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-customers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-customers">
                {analytics?.totalCustomers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.totalSellers || 0} active sellers
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {!analytics?.recentOrders || analytics.recentOrders.length === 0 ? (
                <p className="text-center text-gray-500" data-testid="text-no-recent-orders">
                  No recent orders
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-2"
                      data-testid={`order-${order.id}`}
                    >
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.total}</p>
                        <Badge variant="outline" data-testid={`badge-status-${order.id}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Sellers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              {!analytics?.topSellers || analytics.topSellers.length === 0 ? (
                <p className="text-center text-gray-500" data-testid="text-no-top-sellers">
                  No seller data available
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.topSellers.map((seller, index) => (
                    <div
                      key={seller.sellerId}
                      className="flex items-center justify-between border-b pb-2"
                      data-testid={`seller-${seller.sellerId}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{seller.shopName}</p>
                          <p className="text-sm text-gray-500">
                            {seller.orderCount} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{seller.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/admin")}
              data-testid="button-verify-orders"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Verify Orders
            </Button>
            <Button
              onClick={() => navigate("/admin/users")}
              variant="outline"
              data-testid="button-manage-users"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
