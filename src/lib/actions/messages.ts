'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Conversation, Message } from '@/types';

export async function getConversations() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Fetch conversations where user is a member
  const { data: memberConversations, error: memberError } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (memberError) throw new Error(memberError.message);
  const convIds = memberConversations.map(m => m.conversation_id);

  if (convIds.length === 0) return [];

  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      members:conversation_members(
        user_id,
        profile:profiles(*)
      )
    `)
    .in('id', convIds)
    .order('last_message_at', { ascending: false });

  if (convError) throw new Error(convError.message);

  // Get last messages and format conversations
  const conversationsWithMessages = await Promise.all(
    conversations.map(async (conv: any) => {
      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('*, sender:profiles(*)')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Map member profiles correctly
      const members = conv.members.map((m: any) => m.profile);

      return {
        ...conv,
        members,
        last_message: lastMsgs?.[0] || null,
        unread_count: 0 // Simplification for now
      } as Conversation;
    })
  );

  return conversationsWithMessages;
}

export async function getMessages(conversationId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Message[];
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      media_urls: [],
      message_type: 'text'
    })
    .select('*, sender:profiles(*)')
    .single();

  if (error) throw new Error(error.message);

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return message as Message;
}

export async function createConversation(targetUserId: string, name?: string, type: 'direct' | 'group' = 'direct') {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // If direct conversation already exists between these two users, return it
  if (type === 'direct') {
    const { data: userConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id);

    const { data: targetConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', targetUserId);

    if (userConvs && targetConvs) {
      const commonConv = userConvs.find(uc => 
        targetConvs.some(tc => tc.conversation_id === uc.conversation_id)
      );

      if (commonConv) {
        // Double check it's direct type
        const { data: existing } = await supabase
          .from('conversations')
          .select('id, type')
          .eq('id', commonConv.conversation_id)
          .eq('type', 'direct')
          .single();

        if (existing) return existing.id;
      }
    }
  }

  // Create new conversation
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({
      name: name || null,
      type,
      created_by: user.id,
      last_message_at: new Date().toISOString()
    })
    .select()
    .single();

  if (convError) throw new Error(convError.message);

  // Add members
  const membersToAdd = [
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: targetUserId }
  ];

  const { error: memberError } = await supabase
    .from('conversation_members')
    .insert(membersToAdd);

  if (memberError) throw new Error(memberError.message);

  return conv.id;
}
