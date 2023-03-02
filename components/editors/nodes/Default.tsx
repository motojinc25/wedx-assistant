import React, { memo } from 'react';
import Image from 'next/image';
import { Handle, Position } from 'reactflow';

// eslint-disable-next-line react/display-name
export default memo(({ data }: any) => {
  const imageSrc = '/images/icons/' + data.image;

  return (
    <>
      <Handle type="target" position={ Position.Left } /* @ts-ignore */ />
      <div className="align-middle">
        {data.label}
        <br />
        <Image src={imageSrc} width="28" height="28" alt="Node" />
      </div>
      <Handle type="source" position={ Position.Right } id="a" /* @ts-ignore */ />
    </>
  );
});
