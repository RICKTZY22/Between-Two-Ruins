import type { Chapter } from '@/types';

function Ch10JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 10 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 10: End of Act One. Decay intensity: 1.0.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 10: End of Act One. Decay intensity: 1.0.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 10: End of Act One. Decay intensity: 1.0.]
      </p>
    </>
  );
}

export const ch10Josef: Chapter = {
  id: 'ch10-josef',
  number: 10,
  title: 'End of Act One',
  decayIntensity: 1.0,
  content: <Ch10JosefContent />,
};
