import { NextResponse } from 'next/server';
import { getLessonTags } from '@/lib/services/lesson.service';

export async function GET() {
  try {
    const tags = await getLessonTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json([], { status: 500 });
  }
}
