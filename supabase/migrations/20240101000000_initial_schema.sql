-- Enable UUID extension
create extension if not exists "pgcrypto";

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'customer' check (role in ('customer','owner')),
  address text,
  phone text,
  created_at timestamptz default now()
);

-- menus
create table menus (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  item_name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  available boolean default true,
  created_at timestamptz default now()
);

-- menu_extras
create table menu_extras (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references menus(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  created_at timestamptz default now()
);

-- orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  menu_id uuid references menus(id),
  quantity int not null default 1,
  notes text,
  extras jsonb default '[]',
  status text default 'pending' check (status in ('pending','preparing','delivered')),
  total_amount numeric(10,2) not null,
  created_at timestamptz default now()
);

-- payments (owner-entered only, every row is confirmed)
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  method text default 'gpay',
  notes text,
  added_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  menu_id uuid references menus(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- chat_messages (daily reset via cron)
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  user_name text not null,
  message text not null,
  chat_date date not null default current_date,
  created_at timestamptz default now()
);

-- owner_settings (single row managed by owner)
create table owner_settings (
  id uuid primary key default gen_random_uuid(),
  phone text,
  whatsapp text,
  gpay_qr_url text,
  reminder_message text default 'Dear customer, you have pending dues. Please clear at your earliest.',
  reminder_days int default 10,
  reminder_enabled boolean default true,
  updated_at timestamptz default now()
);

-- ROW LEVEL SECURITY --

-- profiles
alter table profiles enable row level security;
create policy "users read own profile" on profiles for select using (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "owner reads all profiles" on profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'owner'));
create policy "owner updates all profiles" on profiles for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

-- menus (public read, owner write)
alter table menus enable row level security;
create policy "anyone reads menus" on menus for select using (true);
create policy "owner manages menus" on menus for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

-- menu_extras (public read, owner write)
alter table menu_extras enable row level security;
create policy "anyone reads extras" on menu_extras for select using (true);
create policy "owner manages extras" on menu_extras for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

-- orders (customer sees own, owner sees all)
alter table orders enable row level security;
create policy "own orders" on orders for select using (auth.uid() = user_id);
create policy "insert own order" on orders for insert with check (auth.uid() = user_id);
create policy "owner all orders" on orders for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

-- payments (customer reads own, owner inserts and reads all)
alter table payments enable row level security;
create policy "own payments read" on payments for select using (auth.uid() = user_id);
create policy "owner all payments" on payments for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

-- reviews (public read, authenticated insert own)
alter table reviews enable row level security;
create policy "public read reviews" on reviews for select using (true);
create policy "insert own review" on reviews for insert with check (auth.uid() = user_id);

-- chat_messages (authenticated read today, insert own)
alter table chat_messages enable row level security;
create policy "read today messages" on chat_messages for select
  using (auth.uid() is not null and chat_date = current_date);
create policy "insert own message" on chat_messages for insert
  with check (auth.uid() = user_id);

-- owner_settings (public read, owner write)
alter table owner_settings enable row level security;
create policy "anyone reads settings" on owner_settings for select using (true);
create policy "owner manages settings" on owner_settings for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'owner'));
