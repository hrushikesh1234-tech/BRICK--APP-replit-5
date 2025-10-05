import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, LogOut, Search, Users, Store, ArrowLeft, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Seller {
  id: string;
  userId: string;
  shopName: string;
  status: string;
  userName: string;
  userPhone: string;
  createdAt: string;
}

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchSellers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/sellers", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSellers(data);
      } else {
        setSellers([]);
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
      setSellers([]);
    }
  };

  const handleToggleSellerStatus = async (sellerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const response = await fetch(`/api/sellers/${sellerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Seller ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        });
        fetchSellers();
      } else {
        toast({
          title: "Error",
          description: "Failed to update seller status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update seller status",
        variant: "destructive",
      });
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.userPhone.includes(searchTerm)
  );

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
              <h1 className="text-2xl font-bold" data-testid="text-title">User Management</h1>
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
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="mr-2 h-4 w-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="sellers" data-testid="tab-sellers">
              <Store className="mr-2 h-4 w-4" />
              Sellers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500" data-testid="text-no-users">
                    No users found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} data-testid={`user-${user.id}`}>
                          <TableCell className="font-medium" data-testid={`text-name-${user.id}`}>
                            {user.name}
                          </TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" data-testid={`badge-role-${user.id}`}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sellers ({filteredSellers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSellers.length === 0 ? (
                  <p className="text-center text-gray-500" data-testid="text-no-sellers">
                    No sellers found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shop Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSellers.map((seller) => (
                        <TableRow key={seller.id} data-testid={`seller-${seller.id}`}>
                          <TableCell className="font-medium" data-testid={`text-shop-${seller.id}`}>
                            {seller.shopName}
                          </TableCell>
                          <TableCell>{seller.userName}</TableCell>
                          <TableCell>{seller.userPhone}</TableCell>
                          <TableCell>
                            <Badge
                              variant={seller.status === "active" ? "default" : "secondary"}
                              data-testid={`badge-status-${seller.id}`}
                            >
                              {seller.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleSellerStatus(seller.id, seller.status)}
                              data-testid={`button-toggle-status-${seller.id}`}
                            >
                              {seller.status === "active" ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card data-testid="card-total-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users-count">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-sellers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-sellers-count">
                {sellers.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-sellers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-sellers-count">
                {sellers.filter((s) => s.status === "active").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
