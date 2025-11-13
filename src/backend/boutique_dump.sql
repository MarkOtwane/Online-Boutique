--
-- PostgreSQL database dump
--

\restrict gxIOD7CdJ9nWZQkAHWo6QHJdcNRGh2aVj9VPvKxkTifssjgX0ZnuHtxJUjy3N4n

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'MPESA',
    'CARD',
    'CASH'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: ChatConversation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatConversation" (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatConversation" OWNER TO postgres;

--
-- Name: ChatConversationParticipant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatConversationParticipant" (
    id integer NOT NULL,
    "conversationId" integer NOT NULL,
    "userId" integer NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatConversationParticipant" OWNER TO postgres;

--
-- Name: ChatConversationParticipant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChatConversationParticipant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatConversationParticipant_id_seq" OWNER TO postgres;

--
-- Name: ChatConversationParticipant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChatConversationParticipant_id_seq" OWNED BY public."ChatConversationParticipant".id;


--
-- Name: ChatConversation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChatConversation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatConversation_id_seq" OWNER TO postgres;

--
-- Name: ChatConversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChatConversation_id_seq" OWNED BY public."ChatConversation".id;


--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatMessage" (
    id integer NOT NULL,
    "conversationId" integer NOT NULL,
    "senderId" integer NOT NULL,
    "receiverId" integer,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO postgres;

--
-- Name: ChatMessage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChatMessage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatMessage_id_seq" OWNER TO postgres;

--
-- Name: ChatMessage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChatMessage_id_seq" OWNED BY public."ChatMessage".id;


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Comment" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "userId" integer NOT NULL,
    content text NOT NULL,
    "parentId" integer,
    "isAdminResponse" boolean DEFAULT false NOT NULL,
    "isOfficialResponse" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Comment" OWNER TO postgres;

--
-- Name: Comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Comment_id_seq" OWNER TO postgres;

--
-- Name: Comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Comment_id_seq" OWNED BY public."Comment".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    total double precision NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod",
    "phoneNumber" text,
    "transactionId" text,
    "paymentAmount" double precision,
    "paymentDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "checkoutRequestId" text
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItem_id_seq" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_id_seq" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    price double precision NOT NULL,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "commentCount" integer DEFAULT 0 NOT NULL,
    "repostCount" integer DEFAULT 0 NOT NULL,
    "categoryId" integer NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_id_seq" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Repost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Repost" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "userId" integer NOT NULL,
    content text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Repost" OWNER TO postgres;

--
-- Name: Repost_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Repost_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Repost_id_seq" OWNER TO postgres;

--
-- Name: Repost_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Repost_id_seq" OWNED BY public."Repost".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'customer'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isOnline" boolean DEFAULT false NOT NULL,
    "lastSeen" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: ChatConversation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatConversation" ALTER COLUMN id SET DEFAULT nextval('public."ChatConversation_id_seq"'::regclass);


--
-- Name: ChatConversationParticipant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatConversationParticipant" ALTER COLUMN id SET DEFAULT nextval('public."ChatConversationParticipant_id_seq"'::regclass);


--
-- Name: ChatMessage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage" ALTER COLUMN id SET DEFAULT nextval('public."ChatMessage_id_seq"'::regclass);


--
-- Name: Comment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN id SET DEFAULT nextval('public."Comment_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: Repost id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Repost" ALTER COLUMN id SET DEFAULT nextval('public."Repost_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, "createdAt") FROM stdin;
1	Accessories	2025-10-24 11:12:00.875
2	Clothing	2025-10-24 11:12:00.88
\.


--
-- Data for Name: ChatConversation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatConversation" (id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatConversationParticipant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatConversationParticipant" (id, "conversationId", "userId", "joinedAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatMessage" (id, "conversationId", "senderId", "receiverId", content, "isRead", "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comment" (id, "productId", "userId", content, "parentId", "isAdminResponse", "isOfficialResponse", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", total, "paymentStatus", "paymentMethod", "phoneNumber", "transactionId", "paymentAmount", "paymentDate", "createdAt", "updatedAt", "checkoutRequestId") FROM stdin;
1	1	12	PENDING	\N	\N	\N	\N	\N	2025-10-25 05:55:07.287	2025-10-25 05:55:07.287	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price) FROM stdin;
1	1	1	1	12
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, price, "imageUrl", "createdAt", "commentCount", "repostCount", "categoryId") FROM stdin;
5	Leather Jacket	2500	https://res.cloudinary.com/dtlfneiez/image/upload/v1761378107/boutique-products/product-1761378077338-130104259.png	2025-10-25 07:41:52.332	0	0	2
3	Hoodie	2300	https://res.cloudinary.com/dtlfneiez/image/upload/v1761371549/boutique-products/product-1761371544049-598526636.png	2025-10-25 05:52:30.919	0	0	2
4	Leather Jacket	1800	https://res.cloudinary.com/dtlfneiez/image/upload/v1761371792/boutique-products/product-1761371785099-575491018.png	2025-10-25 05:56:33.122	0	0	2
2	Hoodie	3400	https://res.cloudinary.com/dtlfneiez/image/upload/v1761371544/boutique-products/product-1761371535469-321400841.png	2025-10-25 05:52:26.062	0	0	2
1	Demin Jacket	1200	https://res.cloudinary.com/dtlfneiez/image/upload/v1761371467/boutique-products/product-1761371463582-383043822.png	2025-10-25 05:51:14.884	0	0	2
\.


--
-- Data for Name: Repost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Repost" (id, "productId", "userId", content, "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, role, "createdAt", "isOnline", "lastSeen") FROM stdin;
1	admin@boutique.com	$2b$10$eS7fQ55qRQEV19d77nClsO.XAj7dGSGYGO5Anv8I3kcDurT9ATJlq	admin	2025-10-24 11:12:01.066	f	2025-10-24 11:12:01.066
2	customer@boutique.com	$2b$10$X/wAJc3XEIwQfDCd1U4uRuk5kbvp3jicBbCrzVxhUWCj5zYZwI7py	customer	2025-10-24 11:12:01.07	f	2025-10-24 11:12:01.07
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c957bdbf-98bf-4af7-92f5-6c23a3ccc147	116355abbf59537ae64a3e0c177b100726b3c3ae986ec5223830b538311ce986	2025-10-24 14:11:39.262613+03	20251024111138_add_payment_fields	\N	\N	2025-10-24 14:11:38.92295+03	1
37bd4233-5b6a-4d1a-be71-700bef024fed	e93c61decc36aed33a18a93d788ca728da47b32be44579ff0f92e73436dcc1bb	2025-10-24 14:31:48.515634+03	20251024113148_add_checkout_request_id	\N	\N	2025-10-24 14:31:48.508037+03	1
\.


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Category_id_seq"', 2, true);


--
-- Name: ChatConversationParticipant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChatConversationParticipant_id_seq"', 1, false);


--
-- Name: ChatConversation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChatConversation_id_seq"', 1, false);


--
-- Name: ChatMessage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChatMessage_id_seq"', 1, false);


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 1, false);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 1, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_id_seq"', 1, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Product_id_seq"', 5, true);


--
-- Name: Repost_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Repost_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 3, true);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ChatConversationParticipant ChatConversationParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatConversationParticipant"
    ADD CONSTRAINT "ChatConversationParticipant_pkey" PRIMARY KEY (id);


--
-- Name: ChatConversation ChatConversation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatConversation"
    ADD CONSTRAINT "ChatConversation_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Repost Repost_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Repost"
    ADD CONSTRAINT "Repost_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: ChatConversationParticipant_conversationId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ChatConversationParticipant_conversationId_userId_key" ON public."ChatConversationParticipant" USING btree ("conversationId", "userId");


--
-- Name: ChatConversationParticipant_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatConversationParticipant_userId_idx" ON public."ChatConversationParticipant" USING btree ("userId");


--
-- Name: ChatMessage_conversationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_conversationId_idx" ON public."ChatMessage" USING btree ("conversationId");


--
-- Name: ChatMessage_receiverId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_receiverId_idx" ON public."ChatMessage" USING btree ("receiverId");


--
-- Name: ChatMessage_senderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatMessage_senderId_idx" ON public."ChatMessage" USING btree ("senderId");


--
-- Name: Comment_isAdminResponse_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Comment_isAdminResponse_idx" ON public."Comment" USING btree ("isAdminResponse");


--
-- Name: Comment_isOfficialResponse_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Comment_isOfficialResponse_idx" ON public."Comment" USING btree ("isOfficialResponse");


--
-- Name: Comment_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Comment_productId_idx" ON public."Comment" USING btree ("productId");


--
-- Name: Comment_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Comment_userId_idx" ON public."Comment" USING btree ("userId");


--
-- Name: Repost_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Repost_productId_idx" ON public."Repost" USING btree ("productId");


--
-- Name: Repost_productId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Repost_productId_userId_key" ON public."Repost" USING btree ("productId", "userId");


--
-- Name: Repost_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Repost_userId_idx" ON public."Repost" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: ChatConversationParticipant ChatConversationParticipant_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatConversationParticipant"
    ADD CONSTRAINT "ChatConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."ChatConversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatConversationParticipant ChatConversationParticipant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatConversationParticipant"
    ADD CONSTRAINT "ChatConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."ChatConversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Comment Comment_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Repost Repost_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Repost"
    ADD CONSTRAINT "Repost_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Repost Repost_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Repost"
    ADD CONSTRAINT "Repost_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict gxIOD7CdJ9nWZQkAHWo6QHJdcNRGh2aVj9VPvKxkTifssjgX0ZnuHtxJUjy3N4n

