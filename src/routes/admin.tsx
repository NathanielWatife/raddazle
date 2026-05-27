import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { products as initialProducts } from "@/data/products";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Plus, Users, ShoppingBag, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — SOUVENIR" }] }),
  component: AdminPage,
});

const revenueData = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Apr", total: 3200 },
  { name: "May", total: 2800 },
  { name: "Jun", total: 4300 },
];

const usersData = [
  { name: "Mon", count: 42 },
  { name: "Tue", count: 58 },
  { name: "Wed", count: 35 },
  { name: "Thu", count: 74 },
  { name: "Fri", count: 89 },
  { name: "Sat", count: 110 },
  { name: "Sun", count: 95 },
];

function AdminPage() {
  const [products, setProducts] = useState<Product[]>(
    initialProducts.map((p) => ({ ...p, stock: p.stock ?? Math.floor(Math.random() * 50) + 1 }))
  );

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    setEditProduct(product);
  };

  const handleSave = () => {
    if (isEditing === "new") {
      const newProduct = {
        ...editProduct,
        id: Math.random().toString(36).substr(2, 9),
        slug: editProduct.name?.toLowerCase().replace(/\s+/g, '-') || "",
        rating: 0,
        reviewCount: 0,
        images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"],
        details: [],
        inStock: (editProduct.stock || 0) > 0,
      } as Product;
      setProducts([...products, newProduct]);
    } else {
      setProducts(products.map((p) => (p.id === isEditing ? { ...p, ...editProduct, inStock: (editProduct.stock || 0) > 0 } as Product : p)));
    }
    setIsEditing(null);
    setEditProduct({});
  };

  const startAddNew = () => {
    setIsEditing("new");
    setEditProduct({ name: "", category: "objects", price: 0, stock: 0, origin: "", description: "" });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-12 lg:py-16">
      <header className="border-b hairline pb-8 mb-10 flex justify-between items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Control Center</p>
          <h1 className="mt-3 font-serif text-5xl lg:text-7xl">Admin <em className="italic">Portal</em>.</h1>
        </div>
      </header>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="bg-secondary/50 p-1 rounded-sm w-full sm:w-auto overflow-x-auto flex justify-start">
          <TabsTrigger value="analytics" className="text-xs uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Analytics</TabsTrigger>
          <TabsTrigger value="products" className="text-xs uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Products</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Orders</TabsTrigger>
          <TabsTrigger value="users" className="text-xs uppercase tracking-widest px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-hairline rounded-none shadow-none bg-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-normal">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" strokeWidth={1} />
              </CardHeader>
              <CardContent>
                <div className="font-serif text-4xl tabular-nums">€15,400</div>
                <p className="text-xs text-muted-foreground mt-2">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card className="border-hairline rounded-none shadow-none bg-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-normal">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1} />
              </CardHeader>
              <CardContent>
                <div className="font-serif text-4xl tabular-nums">+503</div>
                <p className="text-xs text-muted-foreground mt-2">+12.5% from last week</p>
              </CardContent>
            </Card>
            <Card className="border-hairline rounded-none shadow-none bg-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-normal">Products Sold</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" strokeWidth={1} />
              </CardHeader>
              <CardContent>
                <div className="font-serif text-4xl tabular-nums">1,234</div>
                <p className="text-xs text-muted-foreground mt-2">+19% from last month</p>
              </CardContent>
            </Card>
            <Card className="border-hairline rounded-none shadow-none bg-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-normal">Active Now</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1} />
              </CardHeader>
              <CardContent>
                <div className="font-serif text-4xl tabular-nums">42</div>
                <p className="text-xs text-muted-foreground mt-2">Active in last hour</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-hairline rounded-none shadow-none">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--foreground))" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3 border-hairline rounded-none shadow-none">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Daily Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={usersData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--secondary))'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-3xl">Inventory</h2>
            <Button onClick={startAddNew} className="rounded-none uppercase tracking-widest text-[10px]">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>

          <div className="border hairline">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 pointer-events-none">
                  <TableHead className="w-[80px] text-[10px] uppercase tracking-widest">Image</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Price</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest">Stock</TableHead>
                  <TableHead className="text-right text-[10px] uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <div className="w-12 h-12 bg-secondary overflow-hidden">
                         <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {isEditing === product.id ? (
                        <Input value={editProduct.name} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} className="h-8 rounded-none bg-background" />
                      ) : (
                        product.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === product.id ? (
                         <Input value={editProduct.category} onChange={(e) => setEditProduct({...editProduct, category: e.target.value as any})} className="h-8 w-24 rounded-none bg-background" />
                      ) : (
                        <span className="capitalize text-muted-foreground">{product.category}</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {isEditing === product.id ? (
                        <Input type="number" value={editProduct.price} onChange={(e) => setEditProduct({...editProduct, price: Number(e.target.value)})} className="h-8 w-20 rounded-none bg-background" />
                      ) : (
                        `€${product.price}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing === product.id ? (
                        <Input type="number" value={editProduct.stock} onChange={(e) => setEditProduct({...editProduct, stock: Number(e.target.value)})} className="h-8 w-20 rounded-none bg-background" />
                      ) : (
                        <Badge variant={product.stock && product.stock < 10 ? "destructive" : "secondary"} className="rounded-none font-mono font-normal">
                          {product.stock} left
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       {isEditing === product.id ? (
                          <div className="flex justify-end gap-2">
                             <Button variant="default" size="sm" onClick={handleSave} className="rounded-none h-8 px-3 text-[10px] uppercase tracking-wider">Save</Button>
                             <Button variant="outline" size="sm" onClick={() => setIsEditing(null)} className="rounded-none h-8 px-3 text-[10px] uppercase tracking-wider">Cancel</Button>
                          </div>
                       ) : (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 rounded-none">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 rounded-none hover:bg-destructive hover:text-destructive-foreground">
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
                {isEditing === "new" && (
                   <TableRow>
                     <TableCell>
                        <div className="w-12 h-12 bg-secondary flex items-center justify-center">
                           <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                     </TableCell>
                     <TableCell><Input placeholder="Product name" value={editProduct.name} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} className="h-8 rounded-none" /></TableCell>
                     <TableCell><Input placeholder="Category" value={editProduct.category} onChange={(e) => setEditProduct({...editProduct, category: e.target.value as any})} className="h-8 w-24 rounded-none" /></TableCell>
                     <TableCell><Input type="number" placeholder="Price" value={editProduct.price} onChange={(e) => setEditProduct({...editProduct, price: Number(e.target.value)})} className="h-8 w-20 rounded-none" /></TableCell>
                     <TableCell><Input type="number" placeholder="Stock" value={editProduct.stock} onChange={(e) => setEditProduct({...editProduct, stock: Number(e.target.value)})} className="h-8 w-20 rounded-none" /></TableCell>
                     <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button variant="default" size="sm" onClick={handleSave} className="rounded-none h-8 px-3 text-[10px] uppercase tracking-wider">Save</Button>
                           <Button variant="outline" size="sm" onClick={() => setIsEditing(null)} className="rounded-none h-8 px-3 text-[10px] uppercase tracking-wider">Cancel</Button>
                        </div>
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="animate-in fade-in duration-500">
           <Card className="border-hairline rounded-none shadow-none bg-background">
             <CardHeader>
               <CardTitle className="font-serif text-2xl">Recent Orders</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground text-sm">Order management coming soon.</p>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in duration-500">
          <Card className="border-hairline rounded-none shadow-none bg-background">
             <CardHeader>
               <CardTitle className="font-serif text-2xl">User Directory</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="border hairline">
                   <Table>
                      <TableHeader>
                         <TableRow className="bg-secondary/30 pointer-events-none">
                            <TableHead className="text-[10px] uppercase tracking-widest">Name</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest">Email</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest">Status</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest">Joined</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         <TableRow>
                            <TableCell className="font-medium">Eloise Renault</TableCell>
                            <TableCell className="text-muted-foreground">eloise@example.com</TableCell>
                            <TableCell><Badge variant="secondary" className="rounded-none font-normal">Active</Badge></TableCell>
                            <TableCell className="text-muted-foreground">Sep 12, 2026</TableCell>
                         </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">Marcus Chen</TableCell>
                            <TableCell className="text-muted-foreground">marcus.c@example.com</TableCell>
                            <TableCell><Badge variant="secondary" className="rounded-none font-normal">Active</Badge></TableCell>
                            <TableCell className="text-muted-foreground">Sep 10, 2026</TableCell>
                         </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">Juliette Dubois</TableCell>
                            <TableCell className="text-muted-foreground">j.dubois@example.com</TableCell>
                            <TableCell><Badge variant="outline" className="rounded-none font-normal">Inactive</Badge></TableCell>
                            <TableCell className="text-muted-foreground">Aug 28, 2026</TableCell>
                         </TableRow>
                      </TableBody>
                   </Table>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
