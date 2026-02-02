'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, UserCheck, Shield, ChevronRight, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useGetAdminUsersQuery, useUpdateUserRoleMutation } from '@/store/features/admin/adminApi'
import { useToast } from "@/components/ui/use-toast"

const roles = ['User', 'Admin']

export default function UsersManagementPage() {
    const { data: users, isLoading, error } = useGetAdminUsersQuery()
    const [updateRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation()
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateRole({ userId, newRole }).unwrap()
            toast({
                title: "Success",
                description: `User role updated to ${newRole}`,
                className: "bg-green-50 border-green-200 text-green-900"
            })
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update user role"
            })
        }
    }

    const filteredUsers = (users || []).filter(user => {
        const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
        const userName = user?.userName || ''
        const email = user?.email || ''
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold mb-2">User Management</h1>
                        <p className="text-gray-500">
                            Manage user accounts, roles, and permissions across the platform.
                        </p>
                    </div>
                </div>

                <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-xl">
                    <CardHeader className="border-b bg-white/50">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="rounded-xl border-gray-200">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="font-bold py-4">User</TableHead>
                                    <TableHead className="font-bold py-4">Email</TableHead>
                                    <TableHead className="font-bold py-4 text-center">Current Role</TableHead>
                                    <TableHead className="font-bold py-4">Status</TableHead>
                                    <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => {
                                    if (!user) return null;
                                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || 'Unnamed User';
                                    const email = user.email || 'No email';
                                    const role = user.role || 'User';
                                    const userId = user.id || 'unknown';

                                    return (
                                        <TableRow key={userId} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600">
                                                        {fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{fullName}</div>
                                                        <div className="text-xs text-gray-500">ID: {userId.substring(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-center">
                                                <Badge
                                                    className={`rounded-full px-3 py-1 font-medium ${role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    <span className="text-sm font-medium text-gray-600">Active</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <Select
                                                    onValueChange={(val) => handleRoleChange(userId, val)}
                                                    defaultValue={role}
                                                >
                                                    <SelectTrigger className="w-[140px] ml-auto rounded-xl border-gray-200">
                                                        <SelectValue placeholder="Change Role" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                                        {roles.map((r) => (
                                                            <SelectItem key={r} value={r} className="rounded-lg my-1">
                                                                {r}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Users className="w-12 h-12 stroke-[1px]" />
                                                <p className="text-lg font-medium">No users found matching your search</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
