import Image from 'next/image'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface BlogPostProps {
  title: string
  content: string
  author: string
  publishDate: string
  featuredImage: string
  slug: string
}

export function BlogPost({ title, content, author, publishDate, featuredImage, slug }: BlogPostProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={featuredImage || "/placeholder.svg?height=400&width=600"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-2">By {author} on {new Date(publishDate).toLocaleDateString()}</p>
        <p className="text-gray-700 line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/blog/${slug}`} passHref>
          <Button variant="default" className="w-full">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}