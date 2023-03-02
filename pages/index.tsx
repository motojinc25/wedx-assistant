import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const DynamicComponentWithNoSSR = dynamic(() => import('../components/layouts/Main'), {
  ssr: false,
});

const i18nContent: any = {
  "en-US": {
  },
  "ja-JP": {
  },
};

export default function Home(props: any) {
  const router = useRouter();
  const { locale } = props.context;
  const _: any = i18nContent[locale];

  return (
    <>
      <DynamicComponentWithNoSSR locale={locale} pathname={router.pathname}>
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <main className="flex flex-col items-center pt-[100px] w-full flex-1 px-20 text-center">
            <h1 className="text-6xl font-bold text-stone-900">
              WeDX
              <div className="text-blue-600">
                Assistant
              </div>
            </h1>
          </main>
        </div>
      </DynamicComponentWithNoSSR>
    </>
  );
}

export async function getStaticProps(context: any) {
  return {
    props: {
      context,
    },
  };
}
