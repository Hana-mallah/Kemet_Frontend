import ClientTripDetailPage from './ClientTripDetailPage'

export function generateStaticParams() {
    return []
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function TripDetailPage({ params }: PageProps) {
    const { id } = await params
    return <ClientTripDetailPage id={id} />
}
