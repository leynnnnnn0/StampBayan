import ModuleHeading from "@/components/module-heading";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Staff {
    id: number;
    branch: string;
    username: string;
    remarks?: string;
    is_active: boolean;
}

interface Props {
    staffs: Staff[];
    filters: {
        search?: string;
    };
}

export default function Index({ staffs }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Staff | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Staff | null>(null);

    const form = useForm({
        branch: "",
        username: "",
        password: "",
        confirm_password: "",
        remarks: "",
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingBranch(null);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEditDialog = (branch: Staff) => {
        setEditingBranch(branch);
        form.setData({
            branch: branch.branch,
            username: branch.username,
            password: "",
            confirm_password: "",
            remarks: branch.remarks || "",
            is_active: branch.is_active,
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (editingBranch) {
            form.put(`/business/staffs/${editingBranch.id}`, {
                onSuccess: () => {
                    toast.success("Staff updated successfully");
                    setDialogOpen(false);
                    form.reset();
                },
                onError: () => {
                    toast.error("Failed to update branch");
                },
            });
        } else {
            form.post("/business/staffs", {
                onSuccess: () => {
                    toast.success("Staff created successfully");
                    setDialogOpen(false);
                    form.reset();
                },
                onError: () => {
                    toast.error("Failed to create branch");
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteConfirm) return;

        form.delete(`/business/staffs/${deleteConfirm.id}`, {
            onSuccess: () => {
                toast.success("Staff deleted successfully");
                setDeleteConfirm(null);
            },
            onError: () => {
                toast.error("Failed to delete branch");
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Staff" />
            <ModuleHeading
                title="Staff"
                description="Manage the staff accounts of your business"
            >
                <Button onClick={openCreateDialog}>
                    <Plus />
                    Create New
                </Button>
            </ModuleHeading>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Branch
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Remarks
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staffs?.map((branch) => (
                                <tr key={branch.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {branch.branch}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {branch.username}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                                        {branch.remarks || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                branch.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {branch.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(branch)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            {/* <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteConfirm(branch)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table> 
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBranch ? "Edit Staff" : "Create New Staff"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="branch">Branch</Label>
                            <Input
                                id="branch"
                                type="text"
                                value={form.data.branch}
                                onChange={(e) =>
                                    form.setData("branch", e.target.value)
                                }
                                placeholder="Enter branch name"
                            />
                            {form.errors.branch && (
                                <p className="text-xs text-red-500 mt-1">
                                    {form.errors.branch}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={form.data.username}
                                onChange={(e) => form.setData("username", e.target.value)}
                                placeholder="Enter username"
                            />
                            {form.errors.username && (
                                <p className="text-xs text-red-500 mt-1">
                                    {form.errors.username}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData("password", e.target.value)
                                    }
                                    placeholder={
                                        editingBranch
                                            ? "Leave blank to keep current"
                                            : "Enter password"
                                    }
                                />
                                {form.errors.password && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {form.errors.password}
                                    </p>
                                )}
                            </div>

                            {!editingBranch && (
                                <div>
                                    <Label htmlFor="confirm_password">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={form.data.confirm_password}
                                        onChange={(e) =>
                                            form.setData(
                                                "confirm_password",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Confirm password"
                                    />
                                    {form.errors.confirm_password && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {form.errors.confirm_password}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>


                        <div>
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(e) => form.setData("remarks", e.target.value)}
                                placeholder="Enter remarks"
                                rows={3}
                            />
                            {form.errors.remarks && (
                                <p className="text-xs text-red-500 mt-1">
                                    {form.errors.remarks}
                                </p>
                            )}
                        </div>

                        {editingBranch && (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData("is_active", checked)
                                    }
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={form.processing}>
                                {form.processing
                                    ? "Saving..."
                                    : editingBranch
                                    ? "Update Staff"
                                    : "Create Staff"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteConfirm}
                onOpenChange={() => setDeleteConfirm(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Staff</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deleteConfirm?.branch}</strong>? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
