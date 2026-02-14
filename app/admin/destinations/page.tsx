"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, MapPin, Eye, Loader2, Image as ImageIcon, Video } from "lucide-react"
import {
    useGetDestinationsQuery,
    useDeleteDestinationMutation
} from "@/store/features/destinations/destinationsApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminDestinationsPage() {
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState("")
    const { data: destinations = [], isLoading, error } = useGetDestinationsQuery()
    const [deleteDestination, { isLoading: isDeleting }] = useDeleteDestinationMutation()

    const filteredDestinations = destinations.filter(dest =>
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate stats
    const stats = useMemo(() => {
        const uniqueCities = new Set(destinations.map(d => d.city)).size
        const withImages = destinations.filter(d => d.imageUrl).length
        const withVR = destinations.filter(d => d.vrUrlImage).length

        return {
            total: destinations.length,
            cities: uniqueCities,
            withImages,
            withVR
        }
    }, [destinations])

    const handleDelete = async (id: string) => {
        try {
            await deleteDestination(id).unwrap()
            toast({
                title: "Success",
                description: "Destination deleted successfully",
            })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete destination",
                variant: "destructive",
            })
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
        return <div className="p-8 text-red-500">Error loading destinations. Please try again.</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-bronze">Destinations</h1>
                    <p className="text-bronze/80 mt-1">Manage all travel destinations</p>
                </div>
                <Link href="/admin/destinations/create">
                    <Button className="bg-primary hover:bg-primary/90 text-bronze shadow-sm font-bold btn-active-taupe">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Destination
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-amber-200/40 bg-white/60 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-bronze/60 uppercase tracking-widest">Total Destinations</p>
                                <p className="text-2xl font-bold text-bronze mt-1">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                                <MapPin className="h-6 w-6 text-[#732c02]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200/40 bg-white/60 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-bronze/60 uppercase tracking-widest">Cities</p>
                                <p className="text-2xl font-bold text-bronze mt-1">{stats.cities}</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                                <MapPin className="h-6 w-6 text-[#732c02]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200/40 bg-white/60 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-bronze/60 uppercase tracking-widest">With Images</p>
                                <p className="text-2xl font-bold text-bronze mt-1">{stats.withImages}</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                                <ImageIcon className="h-6 w-6 text-[#F3BF26]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-200/40 bg-white/60 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-bronze/60 uppercase tracking-widest">With VR Tours</p>
                                <p className="text-2xl font-bold text-bronze mt-1">{stats.withVR}</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                                <Video className="h-6 w-6 text-[#F3BF26]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-amber-200/40 bg-white/60 shadow-sm">
                <CardHeader className="border-b border-amber-200/20 bg-amber-50/20">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-bronze">All Destinations</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#732c02] w-4 h-4" />
                            <Input
                                placeholder="Search destinations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 bg-white/80 border-amber-200/40 focus:border-gold focus:ring-gold text-bronze placeholder:text-bronze/40"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-amber-50/30 hover:bg-amber-50/40 border-b border-amber-200/20">
                                <TableHead className="w-[80px] text-bronze/70">Image</TableHead>
                                <TableHead className="text-bronze/70">Name</TableHead>
                                <TableHead className="text-bronze/70">City</TableHead>
                                <TableHead className="text-bronze/70">Price</TableHead>
                                <TableHead className="w-[120px] text-bronze/70">Features</TableHead>
                                <TableHead className="text-right w-[140px] text-bronze/70">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDestinations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-bronze/50">
                                        No destinations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDestinations.map((destination) => (
                                    <TableRow key={destination.id} className="hover:bg-amber-50/40 border-b border-amber-200/20">
                                        <TableCell>
                                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-amber-50 border border-amber-100">
                                                {destination.imageUrl ? (
                                                    <Image
                                                        src={destination.imageUrl}
                                                        alt={destination.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-5 h-5 text-bronze/30" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-bronze">{destination.name}</div>
                                            <div className="text-sm text-bronze/60 line-clamp-1 mt-0.5">
                                                {destination.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-bronze/80">
                                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#732c02]" />
                                                {destination.city}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-bronze">
                                                {destination.estimatedPrice ?? 0} EGP
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1.5">
                                                {destination.imageUrl && (
                                                    <Badge variant="secondary" className="text-xs bg-amber-100 text-bronze hover:bg-amber-200 border-none">
                                                        <ImageIcon className="w-3 h-3 mr-1 text-[#F3BF26]" />
                                                        Image
                                                    </Badge>
                                                )}
                                                {destination.vrUrlImage && (
                                                    <Badge variant="secondary" className="text-xs bg-amber-100 text-bronze hover:bg-amber-200 border-none">
                                                        <Video className="w-3 h-3 mr-1 text-[#F3BF26]" />
                                                        VR
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/destinations/detail?id=${destination.id}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-bronze/60 hover:text-[#732c02] hover:bg-amber-50">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/destinations/edit?id=${destination.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-bronze/60 hover:text-[#732c02] hover:bg-amber-50">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-bronze/60 hover:text-red-600 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-white/95 backdrop-blur-md border-amber-200/40">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-bronze">Delete Destination?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-bronze/70">
                                                                This will permanently delete &quot;{destination.name}&quot;. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="text-bronze border-amber-200/40 hover:bg-amber-50">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(destination.id)}
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
        </motion.div>
    )
}
