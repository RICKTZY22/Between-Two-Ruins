import type { Chapter } from '@/types';

function Ch03JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 3 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 3: Tuesdays. Decay intensity: 0.2.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 3: Tuesdays. Decay intensity: 0.2.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 3: Tuesdays. Decay intensity: 0.2.]
      </p>
    </>
  );
}

export const ch03Josef: Chapter = {
  id: 'ch03-josef',
  number: 3,
  title: 'Tuesdays',
  decayIntensity: 0.2,
  content: <Ch03JosefContent />,
};
