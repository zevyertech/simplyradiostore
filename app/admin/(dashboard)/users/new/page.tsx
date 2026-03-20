import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserForm } from '@/components/admin/user-form'

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Add New User</h1>
          <p className="text-muted-foreground mt-1">Create a new user account</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <UserForm />
      </div>
    </div>
  )
}
