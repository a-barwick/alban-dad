import { cssBundleHref } from '@remix-run/css-bundle'
import {
	json,
	type DataFunctionArgs,
	type LinksFunction,
	type V2_MetaFunction,
} from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import tailwindStylesheetUrl from './styles/tailwind.css'
import { authenticator } from './utils/auth.server'
import { prisma } from './utils/db.server'
import { getEnv } from './utils/env.server'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/favicons/apple-touch-icon.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '32x32',
			href: '/favicons/favicon-32x32.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '16x16',
			href: '/favicons/favicon-16x16.png',
		},
		{ rel: 'manifest', href: '/site.webmanifest' },
		{ rel: 'icon', href: '/favicon.ico' },
		{ rel: 'stylesheet', href: '/fonts/nunito-sans/font.css' },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
	].filter(Boolean)
}

export const meta: V2_MetaFunction = () => {
	return [
		{ title: 'Alban Is A Dad' },
		{ name: 'description', content: 'Find yourself in outer space' },
	]
}

export async function loader({ request }: DataFunctionArgs) {
	const userId = await authenticator.isAuthenticated(request)

	const user = userId
		? await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, name: true, username: true, imageId: true },
		})
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await authenticator.logout(request, { redirectTo: '/' })
	}

	return json({ user, ENV: getEnv() })
}

export default function App() {
	const data = useLoaderData<typeof loader>()
	const { user } = data
	return (
		<html lang="en" className="dark h-full">
			<head>
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Links />
			</head>
			<body className="flex h-full flex-col justify-between bg-night-700 text-white">
				<div className="flex items-center justify-center min-h-screen text-center">
					<h1>Alban's a Dad!</h1>
				</div>
				<ScrollRestoration />
				<Scripts />
				<script
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
					}}
				/>
				<LiveReload />
			</body>
		</html>
	)
}
