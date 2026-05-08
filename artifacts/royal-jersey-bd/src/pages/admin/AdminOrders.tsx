import { useAdminListOrders } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminListOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Orders</h2>
      </div>

      <div className="bg-[#111] rounded-md border border-border/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : orders?.map((order) => (
              <TableRow key={order.id} className="border-border/10 hover:bg-white/5">
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.phone}</TableCell>
                <TableCell className="uppercase text-xs font-mono">{order.paymentMethod}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">৳{order.total.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {!orders?.length && !isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
