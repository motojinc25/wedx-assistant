import React, { memo } from 'react';
import Image from 'next/image';

// eslint-disable-next-line react/display-name
export default memo(({ data }: any) => {
  const imageSrc = '/images/icons/' + data.image;

  return (
    <>
      <div className="align-middle">
        {data.label}
        <br />
        <Image src={imageSrc} width="28" height="28" alt="Node" />
      </div>
    </>
  );
});
