import Link from 'next/link';

import Container from '@/components/Container';
import UploadButton from '@/components/UploadButton';

const Nav = () => {
  return (
    <nav className="flex items-center h-16">
      <Container className="flex gap-6 items-center flex-row">
        <p className="w-40 flex-grow-0 mb-0">
          <Link href="/">
           <span className='font-medium text-2xl text-white'>Galleria</span>
          </Link>
        </p>
        <ul className="flex flex-grow justify-end gap-6 m-0 text-white">
          <li>
            <UploadButton />
          </li>
        </ul>
      </Container>
    </nav>
  )
}

export default Nav;