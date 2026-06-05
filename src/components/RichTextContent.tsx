import { RichText } from '@payloadcms/richtext-lexical/react'

const PROSE = [
  '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black [&_h2]:mt-8 [&_h2]:mb-3',
  '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-black [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-black [&_h4]:mt-4 [&_h4]:mb-1',
  '[&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4',
  '[&_li]:text-gray-600 [&_li]:leading-relaxed [&_li]:mb-1',
  '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4',
  '[&_strong]:font-semibold [&_strong]:text-black',
  '[&_a]:underline [&_a]:text-black [&_a:hover]:text-gray-600',
].join(' ')

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  className?: string
}

export default function RichTextContent({ data, className }: Props) {
  if (!data) return null
  return (
    <RichText
      data={data}
      className={className ? `${PROSE} ${className}` : PROSE}
    />
  )
}
