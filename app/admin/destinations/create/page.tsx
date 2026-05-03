"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Save, Clock, DollarSign, PlusCircle, Trash2, Edit } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useCreateDestinationMutation } from "@/store/features/destinations/destinationsApi"
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation, Category } from "@/store/features/categories/categoriesApi"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const destinationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    imageUrl: z.string().url("Please enter a valid image URL"),
    vrUrlImage: z.string().optional().or(z.literal("")),
    estimatedPrice: z.coerce.number().min(0, "Price must be at least 0"),
    fromWorkingHours: z.string().min(5, "Format: HH:mm:ss"),
    endWorkingHours: z.string().min(5, "Format: HH:mm:ss"),
    categoryId: z.string().min(1, "Category is required"),
})

type DestinationFormValues = z.infer<typeof destinationSchema>

export default function CreateDestinationPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [createDestination, { isLoading }] = useCreateDestinationMutation()

    const { data: categories, isLoading: isLoadingCategories } = useGetCategoriesQuery()
    const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation()
    const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation()
    const [deleteCategory] = useDeleteCategoryMutation()
    
    const [newCategoryName, setNewCategoryName] = useState("")
    const [isCreatingCat, setIsCreatingCat] = useState(false)

    const [isEditingCat, setIsEditingCat] = useState(false)
    const [editCategory, setEditCategory] = useState<Category | null>(null)
    const [editCategoryTitle, setEditCategoryTitle] = useState("")

    const handleCreateCategory = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!newCategoryName.trim()) return
        try {
            await createCategory({ title: newCategoryName }).unwrap()
            setNewCategoryName("")
            setIsCreatingCat(false)
            toast({ title: "Success", description: "Category created successfully" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to create category", variant: "destructive" })
        }
    }

    const handleUpdateCategory = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (!editCategory || !editCategoryTitle.trim()) return
        try {
            await updateCategory({ id: editCategory.id, title: editCategoryTitle.trim() }).unwrap()
            setIsEditingCat(false)
            setEditCategory(null)
            toast({ title: "Success", description: "Category updated successfully" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to update category", variant: "destructive" })
        }
    }

    const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id).unwrap()
                toast({ title: "Success", description: "Category deleted" })
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete category", variant: "destructive" })
            }
        }
    }

    const form = useForm<DestinationFormValues>({
        resolver: zodResolver(destinationSchema),
        defaultValues: {
            name: "",
            city: "",
            description: "",
            imageUrl: "",
            vrUrlImage: "",
            estimatedPrice: 0,
            fromWorkingHours: "09:00:00",
            endWorkingHours: "18:00:00",
            categoryId: "",
        },
    })

    const onSubmit = async (data: DestinationFormValues) => {
        try {
            await createDestination({
                ...data,
                vrUrlImage: data.vrUrlImage || "",
            }).unwrap()

            toast({
                title: "Success",
                description: "Destination created successfully",
            })
            router.push("/admin/destinations")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create destination",
                variant: "destructive",
            })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4">
                <Link href="/admin/destinations">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">Create Destination</h1>
                    <p className="text-gray-500">Add a new destination to the catalog</p>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm max-w-2xl">
                <CardHeader>
                    <CardTitle>Destination Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Pyramids of Giza" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingCategories ? (
                                                    <div className="flex items-center justify-center p-4"><Loader2 className="w-4 h-4 animate-spin" /></div>
                                                ) : categories?.map((cat) => (
                                                    <div key={cat.id} className="relative flex items-center group">
                                                        <SelectItem value={cat.id} className="pr-10 flex-1">{cat.title}</SelectItem>
                                                        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center z-20 gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setEditCategory(cat);
                                                                    setEditCategoryTitle(cat.title);
                                                                    setIsEditingCat(true);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100" 
                                                                onClick={(e) => handleDeleteCategory(e, cat.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="p-2 border-t mt-1">
                                                    {isCreatingCat ? (
                                                        <div className="flex items-center gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                            <Input 
                                                                value={newCategoryName} 
                                                                onChange={(e) => setNewCategoryName(e.target.value)} 
                                                                placeholder="New category..." 
                                                                className="h-8 text-sm"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if(e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleCreateCategory(e as any);
                                                                    }
                                                                }}
                                                            />
                                                            <Button type="button" size="sm" className="h-8" onClick={handleCreateCategory} disabled={isCreatingCategory}>
                                                                {isCreatingCategory ? <Loader2 className="w-3 h-3 animate-spin"/> : "Save"}
                                                            </Button>
                                                            <Button type="button" size="sm" variant="ghost" className="h-8" onClick={(e) => { e.stopPropagation(); setIsCreatingCat(false); }}>Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            className="w-full justify-start text-blue-600 hover:text-blue-700 h-8 text-sm" 
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCreatingCat(true); }}
                                                        >
                                                            <PlusCircle className="mr-2 h-4 w-4" /> Add new category
                                                        </Button>
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Cairo" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="estimatedPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" /> Estimated Price
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fromWorkingHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Opens At
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="09:00:00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endWorkingHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Closes At
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="18:00:00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vrUrlImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>VR Tour URL (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide a detailed description..."
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative px-6 py-2.5 rounded-xl font-medium text-white 
               bg-gradient-to-r from-egyptian-nile to-blue-600 
               hover:from-blue-600 hover:to-egyptian-nile
               transition-all duration-300 shadow-md hover:shadow-lg 
               disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="w-4 h-4" />
                                            Create Destination
                                        </span>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Edit Category Modal */}
            <AlertDialog open={isEditingCat} onOpenChange={setIsEditingCat}>
                <AlertDialogContent className="sm:max-w-[425px] bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-bronze">Update Category</AlertDialogTitle>
                        <AlertDialogDescription className="text-bronze/70">
                            Make changes to the category title here.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="edit-title" className="text-sm font-medium text-bronze">
                                Title
                            </label>
                            <Input
                                id="edit-title"
                                value={editCategoryTitle}
                                onChange={(e) => setEditCategoryTitle(e.target.value)}
                                className="col-span-3 border-amber-200/40 focus:border-gold focus:ring-gold text-bronze"
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsEditingCat(false)} className="border-amber-200/40 text-bronze">
                            Cancel
                        </AlertDialogCancel>
                        <Button 
                            onClick={(e) => handleUpdateCategory(e as any)} 
                            disabled={isUpdatingCategory || !editCategoryTitle.trim()} 
                            className="bg-primary hover:bg-primary/90 text-bronze font-bold"
                        >
                            {isUpdatingCategory ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
