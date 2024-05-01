import Link from 'next/link';

import Container from '@/components/Container';

const Nav = () => {
  return (
    <nav className="flex items-center h-16 border border-zinc-200">
      <Container className="flex gap-6 items-center flex-row">
        <p className="w-40 flex-grow-0 mb-0">
          <Link href="/">
           <span className='font-medium text-2xl'>Galleria</span>
          </Link>
        </p>
        <ul className="flex flex-grow justify-end gap-6 m-0">
          <li>Link</li>
        </ul>
      </Container>
    </nav>
  )
}

export default Nav;