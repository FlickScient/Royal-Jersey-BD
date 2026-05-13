import { useState, useEffect } from "react";
import { useAdminListOrders, useAdminListProducts, useAdminListOffers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Tag, ShoppingCart, DollarSign, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: products } = useAdminListProducts();
  const { data: offers } = useAdminListOffers();
  const { data: orders } = useAdminListOrders();
  const [siteStats, setSiteStats] = useState<{ total: number; today: number; week: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-stats", { credentials: "include" })
      .then(r => r.json())
      .then(setSiteStats)
      .catch(() => {});
  }, []);

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

  const stats = [
    { title: "Total Products", value: products?.length || 0, icon: Package, color: "text-blue-500" },
    { title: "Active Offers", value: offers?.length || 0, icon: Tag, color: "text-green-500" },
    { title: "Total Orders", value: orders?.length || 0, icon: ShoppingCart, color: "text-purple-500" },
    { title: "Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-500" },
    { title: "Visits Today", value: siteStats?.today ?? "—", icon: Eye, color: "text-orange-400" },
    { title: "Visits This Week", value: siteStats?.week ?? "—", icon: Eye, color: "text-teal-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-[#111] border-border/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111] border-border/10">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.slice(0, 5).map((order) => (
                <TableRow key={order.id} className="border-border/10 hover:bg-white/5">
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">৳{order.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {!orders?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
