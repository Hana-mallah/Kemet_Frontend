"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Loader2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { 
    useGetCategoriesQuery, 
    useCreateCategoryMutation, 
    useDeleteCategoryMutation,
    useUpdateCategoryMutation,
    Category
} from "@/store/features/categories/categoriesApi"

export default function AdminCategoriesPage() {
    const { toast } = useToast()
    const { data: categories = [], isLoading, error } = useGetCategoriesQuery()
    
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newTitle, setNewTitle] = useState("")

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editCategory, setEditCategory] = useState<Category | null>(null)
    const [editTitle, setEditTitle] = useState("")

    const handleCreate = async () => {
        if (!newTitle.trim()) return
        try {
            await createCategory({ title: newTitle.trim() }).unwrap()
            toast({ title: "Success", description: "Category created successfully" })
            setNewTitle("")
            setIsCreateOpen(false)
        } catch (err) {
            toast({ title: "Error", description: "Failed to create category", variant: "destructive" })
        }
    }

    const openEditModal = (category: Category) => {
        setEditCategory(category)
        setEditTitle(category.title)
        setIsEditOpen(true)
    }

    const handleUpdate = async () => {
        if (!editCategory || !editTitle.trim()) return
        try {
            await updateCategory({ id: editCategory.id, title: editTitle.trim() }).unwrap()
            toast({ title: "Success", description: "Category updated successfully" })
            setIsEditOpen(false)
            setEditCategory(null)
        } catch (err) {
            toast({ title: "Error", description: "Failed to update category", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id).unwrap()
            toast({ title: "Success", description: "Category deleted successfully" })
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete category", variant: "destructive" })
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#F3BF26]" />
            </div>
        )
    }

    if (error) {
        return <div className="p-8 text-red-500">Error loading categories. Please try again.</div>
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-bronze">Categories</h1>
                    <p className="text-bronze/80 mt-1">Manage destination categories</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-bronze shadow-sm font-bold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <Card className="border-amber-200/40 bg-white/60 shadow-sm">
                <CardHeader className="border-b border-amber-200/20 bg-amber-50/20">
                    <CardTitle className="text-lg font-semibold text-bronze">All Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-amber-50/30 hover:bg-amber-50/40 border-b border-amber-200/20">
                                <TableHead className="text-bronze/70">ID</TableHead>
                                <TableHead className="text-bronze/70">Title</TableHead>
                                <TableHead className="text-right w-[140px] text-bronze/70">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center text-bronze/50">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id} className="hover:bg-amber-50/40 border-b border-amber-200/20">
                                        <TableCell className="font-mono text-xs text-bronze/50">
                                            {category.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-bronze">{category.title}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => openEditModal(category)}
                                                    className="h-8 w-8 text-bronze/60 hover:text-[#732c02] hover:bg-amber-50"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-bronze/60 hover:text-red-600 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-white/95 backdrop-blur-md border-amber-200/40">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-bronze">Delete Category?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-bronze/70">
                                                                This will permanently delete &quot;{category.title}&quot;. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="text-bronze border-amber-200/40 hover:bg-amber-50">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(category.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <AlertDialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <AlertDialogContent className="sm:max-w-[425px] bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-bronze">Update Category</AlertDialogTitle>
                        <AlertDialogDescription className="text-bronze/70">
                            Make changes to the category title here. Click save when you're done.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="title" className="text-sm font-medium text-bronze">
                                Title
                            </label>
                            <Input
                                id="title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="col-span-3 border-amber-200/40 focus:border-gold focus:ring-gold text-bronze"
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsEditOpen(false)} className="border-amber-200/40 text-bronze">
                            Cancel
                        </AlertDialogCancel>
                        <Button 
                            onClick={handleUpdate} 
                            disabled={isUpdating || !editTitle.trim()} 
                            className="bg-primary hover:bg-primary/90 text-bronze font-bold"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Modal */}
            <AlertDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <AlertDialogContent className="sm:max-w-[425px] bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-bronze">Create Category</AlertDialogTitle>
                        <AlertDialogDescription className="text-bronze/70">
                            Add a new destination category to the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="new-title" className="text-sm font-medium text-bronze">
                                Title
                            </label>
                            <Input
                                id="new-title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="col-span-3 border-amber-200/40 focus:border-gold focus:ring-gold text-bronze"
                                placeholder="e.g. Historical"
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsCreateOpen(false)} className="border-amber-200/40 text-bronze">
                            Cancel
                        </AlertDialogCancel>
                        <Button 
                            onClick={handleCreate} 
                            disabled={isCreating || !newTitle.trim()} 
                            className="bg-primary hover:bg-primary/90 text-bronze font-bold"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Create
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
