/* eslint-disable @next/next/no-img-element */
'use client';
import { useQueryClient } from '@tanstack/react-query';

import {
  Ban,
  Blend,
  ChevronDown,
  ChevronLeft,
  Crop,
  Image as ImageIcon,
  Info,
  Loader2,
  Pencil,
  PencilRuler,
  RectangleHorizontal,
  RectangleVertical,
  ScissorsSquare,
  Square,
  Trash2,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Container from '@/components/Container';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CldImage from '@/components/CldImage';
import { CloudinaryResource } from '@/types/cloudinary';
import { CldImageProps, getCldImageUrl } from 'next-cloudinary';
interface Deletion {
  state: string;
}

const MediaViewer = ({ resource }: { resource: CloudinaryResource }) => {
  const queryClient = useQueryClient();

  const router = useRouter();

  const sheetFiltersRef = useRef<HTMLDivElement | null>(null);
  const sheetInfoRef = useRef<HTMLDivElement | null>(null);

  // Sheet / Dialog UI state, basically controlling keeping them open or closed

  const [filterSheetIsOpen, setFilterSheetIsOpen] = useState(false);
  const [infoSheetIsOpen, setInfoSheetIsOpen] = useState(false);
  const [deletion, setDeletion] = useState<Deletion>();

  const [enhancements, setEnhancements] = useState<string>();
  const [crop, setCrop] = useState<string>();
  const [filter, setFilter] = useState<string>();
  const [version, setVersion] = useState<number>(1);
  console.log('enhancements', enhancements);

  type Transformations = Omit<CldImageProps, 'src' | 'alt'>;
  const transformations: Transformations = {};

  if (enhancements === 'restore') {
    transformations.restore = true;
  } else if (enhancements === 'improve') {
    transformations.improve = true;
  } else if (enhancements === 'remove-background') {
    transformations.removeBackground = true;
  }

  if (crop === 'square') {
    if (resource.width > resource.height) {
      transformations.height = resource.width;
    } else {
      transformations.width = resource.height;
    }
    transformations.crop = {
      source: true,
      type: 'fill',
    };
  } else if (crop === 'landscape') {
    transformations.height = Math.floor(resource.width / (16 / 9));
    transformations.crop = {
      source: true,
      type: 'fill',
    };
  } else if (crop === 'portrait') {
    transformations.width = Math.floor(resource.height / (16 / 9));
    transformations.crop = {
      source: true,
      type: 'fill',
    };
  }

  if (typeof filter === 'string' && ['grayscale', 'sepia'].includes(filter)) {
    transformations[filter as keyof Transformations] = true;
  } else if (typeof filter === 'string' && ['sizzle'].includes(filter)) {
    transformations.art = filter;
  } else if (typeof filter === 'string' && filter === 'effects') {
    transformations.effects = [
      { background: 'green' },
      { gradientFade: true },
      { gradientFade: 'symetric,x_0.5' },
    ];
  } else if (typeof filter === 'string' && filter === 'tint') {
    transformations.tint = 'equalize:80:blue:blueviolet';
  }

  const hasTransformation = Object.entries(transformations).length > 0;

  const canvasHeight = transformations.height || resource.height;
  const canvasWidth = transformations.width || resource.width;

  const isSquare = canvasHeight === canvasWidth;
  const isLandscape = canvasWidth > canvasHeight;
  const isPortrait = canvasHeight > canvasWidth;

  const imgStyles: Record<string, string | number> = {};

  if ( isLandscape ) {
    imgStyles.maxWidth = resource.width;
    imgStyles.width = '100%';
    imgStyles.height = 'auto';
  } else if ( isPortrait || isSquare ) {
    imgStyles.maxHeight = resource.height;
    imgStyles.height = '100vh';
    imgStyles.width = 'auto'
  }

  /**
   * closeMenus
   * @description Closes all panel menus and dialogs
   */

  function closeMenus() {
    setFilterSheetIsOpen(false);
    setInfoSheetIsOpen(false);
    setDeletion(undefined);
  }
  /**
   * discardChanges
   */

  function discardChanges() {
    setEnhancements(undefined);
    setCrop(undefined);
    setFilter(undefined);
  }

  /**
   * handleOnSave
   */

  async function handleOnSave() {
    const url = getCldImageUrl({
      width: resource.width,
      height: resource.height,
      src: resource.public_id,
      format: 'default',
      quality: 'default',
      ...transformations
    });

    await fetch(url);

    const results = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        publicId: resource.public_id,
        url
      })
    }).then(r => r.json())

    invalidateQueries();

    closeMenus();
    discardChanges();
    setVersion(Date.now())
    console.log('results', results);
  }

  async function handleOnSaveCopy() {
    const url = getCldImageUrl({
      width: resource.width,
      height: resource.height,
      src: resource.public_id,
      format: 'default',
      quality: 'default',
      ...transformations,
    });

    await fetch(url);

    const { data } = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        url,
      }),
    }).then((r) => r.json());

    invalidateQueries();

    router.push(`/resources/${data.asset_id}`);
  }

  async function handleOnDelete() {
    if (deletion?.state === 'deleting') {
      return;
    }
    setDeletion({
      state: 'deleting',
    });
    await fetch('/api/delete', {
      method: 'POST',
      body: JSON.stringify({
        publicId: resource.public_id,
      }),
    });

    invalidateQueries();

    router.push('/');
  }

  function invalidateQueries() {
    queryClient.invalidateQueries({
      queryKey: [
        'resources',
        String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG),
      ],
    });
  }

  function handleOnDeletionOpenChange(isOpen: boolean) {
    // Reset deletion dialog if  the user is closing it
    if (!isOpen) {
      setDeletion(undefined);
    }
  }

  // Listen for clicks outside of the panel area and if determined
  // to be outside, close the panel. This is marked by using
  // a data attribute to provide an easy way to reference it on
  // multiple elements

  useEffect(() => {
    document.body.addEventListener('click', handleOnOutsideClick);
    return () => {
      document.body.removeEventListener('click', handleOnOutsideClick);
    };
  }, []);

  function handleOnOutsideClick(event: MouseEvent) {
    const excludedElements = Array.from(
      document.querySelectorAll('[data-exclude-close-on-click="true"]')
    );
    const clickedExcludedElement =
      excludedElements.filter((element) =>
        event.composedPath().includes(element)
      ).length > 0;

    if (!clickedExcludedElement) {
      closeMenus();
    }
  }

  return (
    <div className='h-screen px-0'>
      {/** Modal for deletion */}

      <Dialog
        open={deletion && ['confirm', 'deleting'].includes(deletion.state)}
        onOpenChange={handleOnDeletionOpenChange}
      >
        <DialogContent data-exclude-close-on-click={true}>
          <DialogHeader>
            <DialogTitle className='text-center'>
              Are you sure you want to delete?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className='justify-center sm:justify-center'>
          <Button
              variant="destructive"
              onClick={handleOnDelete}
            >
              {deletion?.state === 'deleting' && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {deletion?.state !== 'deleting' && (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/** Edit panel for transformations and filters */}

      <Sheet modal={false} open={filterSheetIsOpen}>
        <SheetContent
          ref={sheetFiltersRef}
          className='w-full sm:w-3/4 grid grid-rows-[1fr_auto]  text-neutral-600 border-0'
          data-exclude-close-on-click={true}
        >
          <Tabs defaultValue='account'>
            <TabsList className='grid grid-cols-3 w-full bg-transparent p-0  shadow border-r'>
              <TabsTrigger value='enhance'>
                <Wand2 />
                <span className='sr-only'>Enhance</span>
              </TabsTrigger>
              <TabsTrigger value='crop'>
                <Crop />
                <span className='sr-only'>Crop & Resize</span>
              </TabsTrigger>
              <TabsTrigger value='filters'>
                <Blend />
                <span className='sr-only'>Filters</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value='enhance'>
              <SheetHeader className='my-4'>
                <SheetTitle className='text-zinc-400 text-sm font-semibold'>
                  Enhancements
                </SheetTitle>
              </SheetHeader>
              <ul className='grid gap-2'>
                <li>
                  <Button
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4 bg-transparent ${
                      !enhancements ? 'border-white' : 'border-transparent'
                    } `}
                    onClick={() => setEnhancements('none')}
                  >
                    <Ban className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>None</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4 bg-transparent ${
                      enhancements == 'improve'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                    onClick={() => setEnhancements('improve')}
                  >
                    <Wand2 className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>Improve</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4 bg-transparent ${
                      enhancements == 'restore'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                    onClick={() => setEnhancements('restore')}
                  >
                    <PencilRuler className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>Restore</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4 bg-transparent ${
                      enhancements == 'remove-background'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                    onClick={() => setEnhancements('remove-background')}
                  >
                    <ScissorsSquare className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>Remove Background</span>
                  </Button>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value='crop'>
              <SheetHeader className='my-4'>
                <SheetTitle className='text-zinc-400 text-sm font-semibold'>
                  Cropping & Resizing
                </SheetTitle>
              </SheetHeader>
              <ul className='grid gap-2'>
                <li>
                  <Button
                    onClick={() => setCrop(undefined)}
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4  ${
                      !crop ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <ImageIcon className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>Original</span>
                  </Button>
                </li>
                <li>
                  <Button
                    onClick={() => setCrop('square')}
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4 bg-transparent ${
                      crop === 'square' ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <Square className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>Square</span>
                  </Button>
                </li>
                <li>
                  <Button
                    onClick={() => setCrop('portrait')}
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4 bg-transparent ${
                      crop === 'portrait'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                  >
                    <RectangleVertical className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>Portrait</span>
                  </Button>
                </li>
                <li>
                  <Button
                    onClick={() => setCrop('landscape')}
                    variant='ghost'
                    className={`text-left justify-start w-full h-14 border-4 bg-transparent ${
                      crop === 'landscape'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                  >
                    <RectangleHorizontal className='w-5 h-5 mr-3' />
                    <span className='text-[1.01rem]'>Landscape</span>
                  </Button>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value='filters'>
              <SheetHeader className='my-4'>
                <SheetTitle className='text-zinc-400 text-sm font-semibold'>
                  Filters
                </SheetTitle>
              </SheetHeader>
              <ul className='grid grid-cols-2 gap-2'>
                <li>
                  <button
                    onClick={() => setFilter(undefined)}
                    className={`w-full border-4 ${
                      !filter ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <CldImage
                      width={156}
                      height={156}
                      crop='fill'
                      src={resource.public_id}
                      alt='No Filter'
                    />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter('grayscale')}
                    className={`w-full border-4 ${
                      filter === 'grayscale'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                  >
                    <CldImage
                      width={156}
                      height={156}
                      crop='fill'
                      grayscale
                      src={resource.public_id}
                      alt='No Filter'
                    />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter('sepia')}
                    className={`w-full border-4 ${
                      filter === 'sepia' ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <CldImage
                      width={156}
                      height={156}
                      crop='fill'
                      sepia
                      src={resource.public_id}
                      alt='No Filter'
                    />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter('effects')}
                    className={`w-full border-4 ${
                      filter === 'effects'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                  >
                    <CldImage
                      width={156}
                      height={156}
                      crop='fill'
                      effects={[
                        {
                          background: 'green',
                        },
                        {
                          gradientFade: true,
                        },
                        {
                          gradientFade: 'symetric,x_0.5',
                        },
                      ]}
                      src={resource.public_id}
                      alt='No Filter'
                    />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter('tint')}
                    className={`w-full border-4 ${
                      filter === 'tint' ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <CldImage
                      width={156}
                      height={156}
                      crop='fill'
                      tint='equalize:80:blue:blueviolet'
                      src={resource.public_id}
                      alt='No Filter'
                    />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFilter('sizzle')}
                    className={`w-full border-4 ${
                      filter === 'sizzle'
                        ? 'border-white'
                        : 'border-transparent'
                    }`}
                  >
                    <CldImage
                      width={156}
                      height={156}
                      crop='fill'
                      art='sizzle'
                      src={resource.public_id}
                      alt='No Filter'
                    />
                  </button>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
          <SheetFooter className='gap-2 sm:flex-col'>
            {hasTransformation && (
              <div className='grid grid-cols-[1fr_4rem] gap-2'>
                <Button
                  onClick={handleOnSave}
                  className='w-full h-14 text-left justify-center items-center bg-blue-500 hover:bg-blue-500/50 text-white'
                >
                  <span className='text-[1.01rem]'>Save</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='w-full h-14 text-left justify-center items-center  bg-blue-500 hover:bg-blue-500/50 text-white'
                    >
                      <span className='sr-only'>More Options</span>
                      <ChevronDown className='h-5 w-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className='w-56'
                    data-exclude-close-on-click={true}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={handleOnSaveCopy}>
                        <span>Save as Copy</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <Button
              className={`w-full h-14 text-left justify-center items-center  ${
                hasTransformation
                  ? 'bg-red-500 hover:bg-red-400 text-white'
                  : 'bg-transparent'
              } `}
              onClick={() => {
                closeMenus();
                discardChanges();
              }}
            >
              <span className='text-[1.01rem]'>
                {hasTransformation ? 'Cancel' : 'Close'}
              </span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/** Info panel for asset metadata */}

      <Sheet modal={false} open={infoSheetIsOpen}>
        <SheetContent
          ref={sheetInfoRef}
          className='w-full sm:w-3/4 grid grid-rows-[auto_1fr_auto] bg-zinc-800 text-white border-0'
          data-exclude-close-on-click={true}
        >
          <SheetHeader className='my-4'>
            <SheetTitle className='text-zinc-200 font-semibold'>
              Info
            </SheetTitle>
          </SheetHeader>
          <div>
            <ul>
              <li className='mb-3'>
                <strong className='block text-xs font-normal text-zinc-400 mb-1'>
                  ID
                </strong>
                <span className='flex gap-4 items-center text-zinc-100'>
                  {resource.public_id}
                </span>
              </li>
              <li className='mb-3'>
                <strong className='block text-xs font-normal text-zinc-400 mb-1'>
                  Date Created
                </strong>
                <span className='flex gap-4 items-center text-zinc-100'>
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </li>
              <li className='mb-3'>
                <strong className='block text-xs font-normal text-zinc-400 mb-1'>
                  Width
                </strong>
                <span className='flex gap-4 items-center text-zinc-100'>
                  {resource.width}
                </span>
              </li>
              <li className='mb-3'>
                <strong className='block text-xs font-normal text-zinc-400 mb-1'>
                  Height
                </strong>
                <span className='flex gap-4 items-center text-zinc-100'>
                  {resource.height}
                </span>
              </li>
              <li className='mb-3'>
                <strong className='block text-xs font-normal text-zinc-400 mb-1'>
                  Format
                </strong>
                <span className='flex gap-4 items-center text-zinc-100'>
                  {resource.format}
                </span>
              </li>
              <li className='mb-3'>
                <strong className='block text-xs font-normal text-zinc-400 mb-1'>
                  Size
                </strong>
                <span className='flex gap-4 items-center text-zinc-100'>
                  {resource.bytes}
                </span>
              </li>

              <li className='mb-3'>
                <strong className='block text-xs font-normal text-zinc-400 mb-1'>
                  Tags
                </strong>
                <span className='flex gap-4 items-center text-zinc-100'>
                  {resource.tags.join(', ')}
                </span>
              </li>
            </ul>
          </div>
          <SheetFooter>
            <Button
              variant='outline'
              className='w-full h-14 text-left justify-center items-center bg-transparent border-zinc-600'
              onClick={() => closeMenus()}
            >
              <span className='text-[1.01rem]'>Close</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/** Asset management navbar */}

      <Container className='fixed z-10 top-0 left-0 w-full h-16 flex items-center justify-between gap-4 bg-transparent backdrop-blur-md'>
        <div className='flex items-center gap-4'>
          <ul>
            <li>
              <Link
                href='/'
                className={`${buttonVariants({
                  variant: 'default',
                })} text-nuetral-600`}
              >
                <ChevronLeft className='h-6 w-6' />
                Back
              </Link>
            </li>
          </ul>
        </div>
        <ul className='flex items-center gap-4'>
          <li>
            <Button variant='ghost' onClick={() => setFilterSheetIsOpen(true)}>
              <Pencil className='h-6 w-6 text-neutral-600' />
              <span className='sr-only'>Edit</span>
            </Button>
          </li>
          <li>
            <Button
              variant='ghost'
              className='text-white'
              onClick={() => setInfoSheetIsOpen(true)}
            >
              <Info className='h-6 w-6  text-neutral-600' />
              <span className='sr-only'>Info</span>
            </Button>
          </li>
          <li>
            <Button
              variant='ghost'
              className='text-white'
              onClick={() => setDeletion({ state: 'confirm' })}
            >
              <Trash2 className='h-6 w-6  text-neutral-600' />
              <span className='sr-only'>Delete</span>
            </Button>
          </li>
        </ul>
      </Container>

      {/** Asset viewer */}

      <div className='relative flex justify-center items-center align-center w-full h-full '>
        <CldImage
          key={`${JSON.stringify(transformations)}-${version}`}
          className='object-contain '
          width={resource.width}
          height={resource.height}
          src={resource.public_id}
          alt={`Image of ${resource.public_id}`}
          style={imgStyles}
          version={version}
          {...transformations}
        />
      </div>
    </div>
  );
};

export default MediaViewer;
