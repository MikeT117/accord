import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/home/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/app/home/"!</div>
}
