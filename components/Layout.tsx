import type { FC, ReactNode } from 'react'
import Head from 'next/head.js'
import Nav, { NavProps } from './Nav'
import Logo from './Steamship'
import { ComponentType } from 'react'
import Banner from "../components/Banner"

export interface LayoutProps extends NavProps {
  children?: ReactNode
  title?: string
  description?: string
}

const Layout: FC<LayoutProps> = ({
  title,
  description,
  path,
  deployButton,
  children,
}) => {
  return (
    <div className="mx-auto h-screen flex flex-col">
      <Head>
        {title && <title>{`${title} - Steamship + Vercel Examples`}</title>}
        {description && <meta name="description" content={description} />}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className=" bg-accents-0">
      <Banner/>
        {children}</div>

      <footer className="py-10 w-full mt-auto border-t flex items-center justify-center bg-accents-1 z-20">
      <Logo
            className="inline-block h-6 mr-1 text-primary"
          /> 
        <span className="text-primary">Created by:&nbsp;</span> 
        <a
          href="mailto:enias@steamship.com"
          aria-label="Enias e-mail"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600"
        >
          Enias@Steamship
        </a>. Based on the
        <a
          href="https://github.com/steamship-core/vercel-examples/tree/main/prompt-app"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 ml-1 mr-1"
        > prompt-app
        </a> template.

      </footer>
    </div>
  )
}

export default Layout


const Noop: FC<{ children?: ReactNode }> = ({ children }) => <>{children}</>

export interface LayoutProps extends NavProps {
    children?: ReactNode;
    title?: string;
    description?: string;
}

export function getLayout<LP extends {}>(
  Component: ComponentType<any>
): ComponentType<LP> {
  return (Component as any).Layout || Noop
}