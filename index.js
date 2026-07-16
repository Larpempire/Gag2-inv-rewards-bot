const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const express = require('express');
require('dotenv').config();

// ================= CONFIG =================
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const OWNER_ID = '1464634211406188721';
const TICKET_CATEGORY = '1527258660408135710';
const SUPPORT_ROLE = '1527279968680415293';
const INVITE_LOG_CHANNEL = '1527259358424203264';
const EMBED_COLOR = 16711910;
const BANNER = 'https://i.imgur.com/OMHhUGL.gif';
const THUMBNAIL = 'https://message.style/cdn/images/5940ba99fef2d309b7bbddd8c31df76e967566ec4f9f26b284c5903e8c4ee2b8.png';

const DIAMOND = '<a:DiamondAnnouncer:1527264416033407056>';
const ARROW = '<a:pink_Rarrow:1527265171045875725>';
const GIFT = '<a:hotpinkpresent:1527266260566413475>';
const THREE_HEARTS = '<a:threehearts:1527264720195813396>';
const PINK_BLOB = '<a:pinkblob:1527264540457304184>';
const PINK_HEART = '<a:PinkHeart:1527268815174369404>';
const SHADE_JUMP = '<a:ShadeSiaJump:1527264239083978833>';

// ================= EXPRESS KEEP ALIVE =================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is alive â'));
app.listen(PORT, () => console.log(`ð Server running on port ${PORT}`));

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let invitesCache = new Map();

// ================= UTILS =================
function createRewardEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(THUMBNAIL)
    .setImage(BANNER);
}

// ================= INVITE TRACKER =================
async function fetchInvites(guild) {
  try {
    const invites = await guild.invites.fetch();
    const inviteMap = new Map();
    invites.forEach(invite => {
      if (invite.inviterId) {
        inviteMap.set(invite.code, {
          uses: invite.uses,
          inviterId: invite.inviterId
        });
      }
    });
    return inviteMap;
  } catch (error) {
    console.error('Error fetching invites:', error);
    return new Map();
  }
}

client.on(Events.ClientReady, async () => {
  console.log(`â Logged in as ${client.user.tag}`);
  
  // Cache invites for all guilds
  for (const [guildId, guild] of client.guilds.cache) {
    const invites = await fetchInvites(guild);
    invitesCache.set(guildId, invites);
    console.log(`ð Cached ${invites.size} invites for ${guild.name}`);
  }
});

client.on(Events.InviteCreate, (invite) => {
  const guildInvites = invitesCache.get(invite.guild.id) || new Map();
  guildInvites.set(invite.code, { uses: invite.uses, inviterId: invite.inviterId });
  invitesCache.set(invite.guild.id, guildInvites);
});

client.on(Events.InviteDelete, (invite) => {
  const guildInvites = invitesCache.get(invite.guild.id);
  if (guildInvites) {
    guildInvites.delete(invite.code);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  const guild = member.guild;
  const guildInvites = invitesCache.get(guild.id);
  if (!guildInvites) return;

  const newInvites = await fetchInvites(guild);
  let inviterId = null;
  let inviteUses = 0;

  // Find which invite was used
  for (const [code, data] of newInvites) {
    const oldData = guildInvites.get(code);
    if (oldData && data.uses > oldData.uses) {
      inviterId = data.inviterId;
      inviteUses = data.uses;
      break;
    }
  }

  // Update cache
  invitesCache.set(guild.id, newInvites);

  if (inviterId) {
    const logChannel = guild.channels.cache.get(INVITE_LOG_CHANNEL);
    if (logChannel) {
      let messageText = `${THREE_HEARTS} Congratulations <@${inviterId}>!\n`;
      messageText += `${ARROW} You now have **${inviteUses}** invite(s)!\n`;
      messageText += `${PINK_HEART} Keep inviting friends to unlock amazing rewards!\n\n`;

      // Milestone messages
      let milestone = '';
      if (inviteUses === 1) milestone = 'Great start!';
      else if (inviteUses === 2) milestone = 'Keep going!';
      else if (inviteUses === 3) milestone = "You're doing great!";
      else if (inviteUses === 5) milestone = 'Congratulations! You unlocked the Golden Dragonfly reward!';
      else if (inviteUses === 10) milestone = 'Amazing! You unlocked the Raccoon reward!';
      else if (inviteUses === 15) milestone = 'Awesome! You unlocked the Unicorn reward!';
      else if (inviteUses === 25) milestone = 'Incredible! You unlocked the Ice Serpent reward!';

      if (milestone) {
        messageText += `**Milestone:** ${milestone}`;
      }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle('ð New Invite!')
        .setDescription(messageText);

      logChannel.send({ embeds: [embed] }).catch(console.error);
    }
  }
});

// ================= COMMANDS =================
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === '!create_ticket_panel' && message.author.id === OWNER_ID) {
    // Embed 1: Banner only
    const bannerEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setImage(BANNER);

    // Embed 2
    const mainEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`${DIAMOND} Claim Rewards`)
      .setDescription(
        `${THREE_HEARTS} **Invited enough friends?**\n\n` +
        `${GIFT} **Reward Claims**\n` +
        `${ARROW} Click the button below to create a reward ticket.\n` +
        `${ARROW} Tell us your current invite count.\n` +
        `${ARROW} Staff will verify your invites before rewards are given.\n` +
        `${ARROW} Please be patient while waiting for a response.\n\n` +
        `> ### ${THREE_HEARTS} Thank you for supporting Grow a Garden 2 Rewards!`
      )
      .setThumbnail(THUMBNAIL);

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_reward_ticket')
        .setLabel('ð Claim Rewards')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ embeds: [bannerEmbed, mainEmbed], components: [button] });
    await message.delete().catch(() => {});
  }
});

// ================= TICKET SYSTEM =================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user, guild } = interaction;

  if (customId === 'create_reward_ticket') {
    const existingTicket = guild.channels.cache.find(
      ch => ch.name === `${user.username.toLowerCase()}-rewards` && ch.parentId === TICKET_CATEGORY
    );

    if (existingTicket) {
      return interaction.reply({ 
        content: 'You already have an open reward ticket.', 
        ephemeral: true 
      });
    }

    try {
      const ticketChannel = await guild.channels.create({
        name: `${user.username.toLowerCase()}-rewards`,
        type: 0, // GUILD_TEXT
        parent: TICKET_CATEGORY,
        permissionOverwrites: [
          { id: guild.id, deny: ['ViewChannel'] },
          { id: SUPPORT_ROLE, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
          { id: user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] }
        ]
      });

      await interaction.reply({ 
        content: `Your reward ticket has been created: ${ticketChannel}`, 
        ephemeral: true 
      });

      // Ticket embeds
      const bannerEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setImage(BANNER);

      const ticketEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle('Reward Claim')
        .setDescription(
          `${THREE_HEARTS} **Welcome!**\n\n` +
          `${PINK_HEART} Tell us how many invites you currently have.\n` +
          `${PINK_HEART} Tell us which reward you want to claim.\n` +
          `${PINK_HEART} Wait patiently while a staff member verifies your invites.\n\n` +
          `${PINK_BLOB} Thank you for supporting our community!`
        )
        .setThumbnail(THUMBNAIL);

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ 
        embeds: [bannerEmbed, ticketEmbed], 
        components: [closeButton] 
      });
    } catch (error) {
      console.error('Ticket creation error:', error);
      await interaction.reply({ content: 'Failed to create ticket. Please try again.', ephemeral: true });
    }
  }

  if (customId === 'close_ticket') {
    await interaction.reply({ content: 'Closing ticket in 5 seconds...', ephemeral: true });
    
    setTimeout(async () => {
      await interaction.channel.delete().catch(console.error);
    }, 5000);
  }
});

client.login(TOKEN).catch(console.error);
