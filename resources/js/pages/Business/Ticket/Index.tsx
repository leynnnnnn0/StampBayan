import { useState } from "react";
import { router, useForm, Head } from "@inertiajs/react";
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, ImageIcon, X } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import ModuleHeading from "@/components/module-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  status_color: string;
  priority_color: string;
  created_at: string;
  replies_count: number;
  has_images: boolean;
  last_reply: {
    message: string;
    created_at: string;
    is_staff: boolean;
  } | null;
}

interface Props {
  tickets: Ticket[];
  counts: {
    all: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  currentStatus: string;
}

export default function Index({ tickets, counts, currentStatus }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const { data, setData, processing, errors, reset } = useForm({
    subject: "",
    description: "",
    priority: "medium",
    images: [] as File[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    
    data.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    router.post('/business/tickets', formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
        setImagePreviews([]);
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...data.images, ...files];
    setData('images', newImages);
    
    // Create preview URLs for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    setData('images', newImages);
    
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const handleTabChange = (status: string) => {
    router.get('/business/tickets', { status }, { preserveState: true });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadgeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colorMap[color] || colorMap.gray;
  };

  const getPriorityBadgeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <AppLayout>
      <Head title="Tickets" />
      
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <ModuleHeading 
            title="Tickets" 
            description="Manage your support tickets here." 
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>
                    Submit a support ticket and we'll get back to you as soon as possible.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder="Brief description of the issue"
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-red-500">{errors.priority}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Provide detailed information about your issue..."
                      rows={5}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="images">Attachments (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You can upload multiple images (max 5MB each)
                    </p>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      reset();
                      setImagePreviews([]);
                    }}
                    disabled={processing}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {processing ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={currentStatus} onValueChange={handleTabChange}>
          {/* Mobile: Scrollable horizontal tabs */}
          <div className="md:hidden overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="all" className="flex-1 whitespace-nowrap px-4">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="open" className="flex-1 whitespace-nowrap px-4">
                Open ({counts.open})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex-1 whitespace-nowrap px-4">
                In Progress ({counts.in_progress})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex-1 whitespace-nowrap px-4">
                Resolved ({counts.resolved})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex-1 whitespace-nowrap px-4">
                Closed ({counts.closed})
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Grid layout */}
          <TabsList className="hidden md:grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({counts.open})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({counts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({counts.resolved})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({counts.closed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentStatus} className="mt-4 md:mt-6">
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 px-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-center">No tickets found</h3>
                  <p className="text-muted-foreground text-center mb-4 text-sm">
                    {currentStatus === 'all' 
                      ? "You haven't created any tickets yet."
                      : `No ${currentStatus.replace('_', ' ')} tickets.`}
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.visit(`/business/tickets/${ticket.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base sm:text-lg truncate">{ticket.subject}</CardTitle>
                            {ticket.has_images && (
                              <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <CardDescription className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs">
                            <span className="font-mono">{ticket.ticket_number}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{ticket.created_at}</span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={`text-xs ${getPriorityBadgeColor(ticket.priority_color)}`}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className={`flex items-center gap-1 text-xs ${getStatusBadgeColor(ticket.status_color)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="hidden sm:inline">{ticket.status.replace('_', ' ')}</span>
                            <span className="sm:hidden capitalize">{ticket.status.split('_')[0]}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                        {ticket.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">{ticket.replies_count} {ticket.replies_count === 1 ? 'reply' : 'replies'}</span>
                        </div>
                        {ticket.last_reply && (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="truncate">Last reply: {ticket.last_reply.created_at}</span>
                            {ticket.last_reply.is_staff && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">Staff</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
