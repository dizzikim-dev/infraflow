# Community Knowledge Base Crawling: Research & Implementation Guide

> **Date**: 2026-02-22
> **Purpose**: Research the best methods for crawling/scraping community websites and forums to build a knowledge base for infrastructure/cloud/networking Q&A content.
> **Relevance to InfraFlow**: Feeding Layer 2 (UNDERSTAND) and Layer 3 (RECOMMEND) with real-world community knowledge about infrastructure patterns, troubleshooting, and best practices.

---

## Table of Contents

1. [API-Based Collection Methods](#1-api-based-collection-methods)
2. [Non-API Crawling Methods](#2-non-api-crawling-methods)
3. [Data Extraction Patterns for Q&A Sites](#3-data-extraction-patterns-for-qa-sites)
4. [Legal and Ethical Considerations](#4-legal-and-ethical-considerations)
5. [Data Quality and Filtering](#5-data-quality-and-filtering)
6. [Storage and Processing Pipeline](#6-storage-and-processing-pipeline)
7. [Practical Tools and Services](#7-practical-tools-and-services)
8. [Recommended Architecture for InfraFlow](#8-recommended-architecture-for-infraflow)

---

## 1. API-Based Collection Methods

### 1.1 StackExchange API

**Why it matters**: Stack Overflow, Server Fault, and Network Engineering Stack Exchange contain the richest Q&A corpus for infrastructure topics. All content is licensed under CC BY-SA 4.0.

**API Version**: v2.3 (current)
**Base URL**: `https://api.stackexchange.com/2.3`

**Rate Limits**:
- Without API key: 300 requests/day per IP
- With API key (registered app): 10,000 requests/day
- With access token: 10,000 requests/day (same quota, but allows write and per-user queries)
- Backoff: API returns a `backoff` field in responses; you must wait that many seconds before the next call

**Key Endpoints for Knowledge Base Building**:

```bash
# Search questions by infrastructure tags
GET /2.3/questions?order=desc&sort=votes&tagged=networking;aws&site=serverfault&filter=withbody&pagesize=100

# Get answers for a question
GET /2.3/questions/{ids}/answers?order=desc&sort=votes&site=serverfault&filter=withbody

# Search across sites
GET /2.3/search/advanced?tagged=kubernetes;networking&accepted=True&site=stackoverflow&filter=withbody
```

**Python Collection Script**:

```python
import requests
import time
import json
from pathlib import Path

class StackExchangeCrawler:
    BASE_URL = "https://api.stackexchange.com/2.3"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key
        self.session = requests.Session()
        self.quota_remaining = 10000

    def _request(self, endpoint: str, params: dict) -> dict:
        if self.api_key:
            params["key"] = self.api_key
        params["filter"] = "withbody"  # Include body text

        resp = self.session.get(f"{self.BASE_URL}{endpoint}", params=params)
        data = resp.json()

        self.quota_remaining = data.get("quota_remaining", 0)

        # Respect backoff
        if "backoff" in data:
            time.sleep(data["backoff"])

        return data

    def get_questions_by_tags(
        self,
        tags: list[str],
        site: str = "serverfault",
        min_score: int = 5,
        page_size: int = 100,
        max_pages: int = 10
    ) -> list[dict]:
        """Fetch high-quality questions filtered by tags and minimum score."""
        all_questions = []

        for page in range(1, max_pages + 1):
            data = self._request("/questions", {
                "order": "desc",
                "sort": "votes",
                "tagged": ";".join(tags),
                "site": site,
                "pagesize": page_size,
                "page": page,
                "min": min_score,  # Minimum score filter
            })

            all_questions.extend(data.get("items", []))

            if not data.get("has_more", False):
                break

            time.sleep(0.5)  # Be polite

        return all_questions

    def get_answers(self, question_ids: list[int], site: str = "serverfault") -> list[dict]:
        """Fetch answers for a batch of question IDs (up to 100 per call)."""
        ids_str = ";".join(str(qid) for qid in question_ids[:100])
        data = self._request(f"/questions/{ids_str}/answers", {
            "order": "desc",
            "sort": "votes",
            "site": site,
            "pagesize": 100,
        })
        return data.get("items", [])

# Target tags for infrastructure knowledge
INFRA_TAGS = {
    "serverfault": [
        "networking", "firewall", "load-balancing", "dns", "vpn",
        "cisco", "aws", "azure", "kubernetes", "docker",
        "high-availability", "ssl", "active-directory", "nginx",
    ],
    "stackoverflow": [
        "terraform", "kubernetes", "docker-compose", "aws-vpc",
        "azure-networking", "google-cloud-networking", "ansible",
    ],
    "networkengineering": [
        "routing", "switching", "bgp", "ospf", "vlan", "firewall",
        "cisco", "juniper", "sd-wan", "mpls",
    ],
}
```

**Data Dump Alternative** (recommended for bulk collection):

StackExchange publishes quarterly data dumps under CC BY-SA 4.0 license. As of late 2025, these are available through:
- **Academic Torrents**: Full dumps up to 2025-12-31 at `academictorrents.com`
- **Internet Archive**: `archive.org/details/stackexchange`
- **Community Data Dump**: `communitydatadump.com`

The dumps contain XML files for Posts, Users, Tags, Comments, Votes, and PostHistory per site. For infrastructure use cases, download Server Fault, Network Engineering, and relevant Stack Overflow tag subsets.

```python
# Parsing StackExchange XML dump
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime

@dataclass
class QAPair:
    question_id: int
    title: str
    body: str
    tags: list[str]
    score: int
    answer_count: int
    accepted_answer_id: int | None
    creation_date: datetime
    answers: list[dict]

def parse_posts_xml(filepath: str, min_score: int = 3) -> list[QAPair]:
    """Parse StackExchange Posts.xml dump for questions with answers."""
    questions = {}
    answers = {}

    for event, elem in ET.iterparse(filepath, events=("end",)):
        if elem.tag != "row":
            continue

        post_type = int(elem.get("PostTypeId", 0))
        score = int(elem.get("Score", 0))

        if post_type == 1 and score >= min_score:  # Question
            qid = int(elem.get("Id"))
            tags_raw = elem.get("Tags", "")
            tags = [t for t in tags_raw.replace("<", "").split(">") if t]

            questions[qid] = QAPair(
                question_id=qid,
                title=elem.get("Title", ""),
                body=elem.get("Body", ""),
                tags=tags,
                score=score,
                answer_count=int(elem.get("AnswerCount", 0)),
                accepted_answer_id=(
                    int(elem.get("AcceptedAnswerId"))
                    if elem.get("AcceptedAnswerId") else None
                ),
                creation_date=datetime.fromisoformat(elem.get("CreationDate")),
                answers=[],
            )
        elif post_type == 2:  # Answer
            parent_id = int(elem.get("ParentId", 0))
            answers.setdefault(parent_id, []).append({
                "answer_id": int(elem.get("Id")),
                "body": elem.get("Body", ""),
                "score": score,
                "is_accepted": False,  # Will be set below
            })

        elem.clear()  # Free memory

    # Link answers to questions
    for qid, qa in questions.items():
        qa.answers = sorted(
            answers.get(qid, []),
            key=lambda a: a["score"],
            reverse=True,
        )
        for ans in qa.answers:
            if qa.accepted_answer_id and ans["answer_id"] == qa.accepted_answer_id:
                ans["is_accepted"] = True

    return list(questions.values())
```

### 1.2 Reddit API

**Current State (2025-2026)**: Reddit's API underwent major changes in 2023, introducing paid tiers at $0.24 per 1,000 API calls for high-volume usage. Free tier access is severely limited. Third-party apps like Apollo and Reddit is Fun shut down as a result.

**Free Tier Limits** (as of 2025):
- 100 requests/minute for OAuth-authenticated apps
- Read-only access for most endpoints
- Must register an app and get pre-approval for non-personal projects
- No bulk data export endpoints

**Relevant Subreddits for Infrastructure KB**:
- r/networking, r/sysadmin, r/aws, r/azure, r/googlecloud
- r/devops, r/kubernetes, r/netsec, r/homelab
- r/cisco, r/paloaltonetworks, r/fortinet, r/juniper

**Python Example (using PRAW)**:

```python
import praw
import json
from datetime import datetime

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="InfraKB:v1.0 (by /u/your_username)"
)

def collect_subreddit_qa(
    subreddit_name: str,
    limit: int = 1000,
    min_score: int = 10,
    time_filter: str = "all"
) -> list[dict]:
    """Collect top posts with comments from a subreddit."""
    subreddit = reddit.subreddit(subreddit_name)
    results = []

    for submission in subreddit.top(time_filter=time_filter, limit=limit):
        if submission.score < min_score:
            continue

        submission.comments.replace_more(limit=3)  # Expand "more comments"

        top_comments = sorted(
            [c for c in submission.comments.list() if hasattr(c, "score")],
            key=lambda c: c.score,
            reverse=True
        )[:10]

        results.append({
            "id": submission.id,
            "title": submission.title,
            "body": submission.selftext,
            "score": submission.score,
            "url": submission.url,
            "created_utc": datetime.fromtimestamp(submission.created_utc).isoformat(),
            "num_comments": submission.num_comments,
            "flair": submission.link_flair_text,
            "subreddit": subreddit_name,
            "answers": [
                {
                    "id": c.id,
                    "body": c.body,
                    "score": c.score,
                    "is_top_level": c.parent_id.startswith("t3_"),
                    "created_utc": datetime.fromtimestamp(c.created_utc).isoformat(),
                }
                for c in top_comments
            ],
        })

    return results
```

**Better Alternative: Arctic Shift Archive**

Given Reddit's API restrictions, Arctic Shift (successor to Pushshift) is the recommended path for bulk historical data:

- **URL**: `arctic-shift.photon-reddit.com`
- **GitHub**: `github.com/ArthurHeitmann/arctic_shift`
- **Coverage**: Reddit data from 2005 to present (with some gaps)
- **Format**: zstandard-compressed NDJSON
- **Access**: Web search interface, API, and bulk download dumps

```python
import zstandard
import json
import io

def read_arctic_shift_dump(filepath: str, subreddits: set[str], min_score: int = 5):
    """Read Arctic Shift NDJSON dump, filtering by subreddit and score."""
    dctx = zstandard.ZstdDecompressor()

    with open(filepath, "rb") as fh:
        reader = dctx.stream_reader(fh)
        text_stream = io.TextIOWrapper(reader, encoding="utf-8")

        for line in text_stream:
            post = json.loads(line)

            subreddit = post.get("subreddit", "").lower()
            score = post.get("score", 0)

            if subreddit in subreddits and score >= min_score:
                yield {
                    "id": post.get("id"),
                    "title": post.get("title", ""),
                    "body": post.get("selftext", post.get("body", "")),
                    "score": score,
                    "subreddit": subreddit,
                    "created_utc": post.get("created_utc"),
                    "num_comments": post.get("num_comments", 0),
                    "permalink": post.get("permalink", ""),
                }

# Usage
TARGET_SUBS = {"networking", "sysadmin", "aws", "azure", "devops", "kubernetes"}
for post in read_arctic_shift_dump("RS_2024-06.zst", TARGET_SUBS, min_score=10):
    process_post(post)
```

### 1.3 GitHub Discussions API

**API Type**: GraphQL only (Discussions are not available via REST API)
**Rate Limit**: 5,000 points/hour (GraphQL cost-based)
**Authentication**: Personal access token with `repo` scope (for private repos) or `public_repo`

**Key Repositories with Infrastructure Discussions**:
- `hashicorp/terraform` - Terraform configuration, providers, state management
- `kubernetes/kubernetes` - K8s architecture, networking, troubleshooting
- `pulumi/pulumi` - Infrastructure as code
- `docker/compose` - Container orchestration
- `cloudflare/cloudflared` - Edge networking

```python
import requests
import json

GITHUB_TOKEN = "ghp_xxxx"
GRAPHQL_URL = "https://api.github.com/graphql"

def fetch_discussions(owner: str, repo: str, num: int = 100, after: str | None = None) -> dict:
    """Fetch discussions from a GitHub repository."""
    query = """
    query($owner: String!, $repo: String!, $num: Int!, $after: String) {
      repository(owner: $owner, name: $repo) {
        discussions(first: $num, after: $after, orderBy: {field: CREATED_AT, direction: DESC}) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            title
            body
            createdAt
            upvoteCount
            category { name }
            labels(first: 10) { nodes { name } }
            answer {
              body
              createdAt
              upvoteCount
              author { login }
            }
            comments(first: 20) {
              nodes {
                body
                createdAt
                upvoteCount
                author { login }
                replies(first: 10) {
                  nodes {
                    body
                    createdAt
                    upvoteCount
                    author { login }
                  }
                }
              }
            }
          }
        }
      }
    }
    """

    resp = requests.post(
        GRAPHQL_URL,
        headers={"Authorization": f"Bearer {GITHUB_TOKEN}"},
        json={
            "query": query,
            "variables": {
                "owner": owner,
                "repo": repo,
                "num": num,
                "after": after,
            },
        },
    )
    return resp.json()

def crawl_all_discussions(owner: str, repo: str) -> list[dict]:
    """Paginate through all discussions in a repository."""
    all_discussions = []
    cursor = None

    while True:
        result = fetch_discussions(owner, repo, num=100, after=cursor)
        repo_data = result["data"]["repository"]["discussions"]

        all_discussions.extend(repo_data["nodes"])

        if not repo_data["pageInfo"]["hasNextPage"]:
            break

        cursor = repo_data["pageInfo"]["endCursor"]

    return all_discussions
```

### 1.4 Discourse API

Many infrastructure communities run on Discourse: Terraform, Docker, HashiCorp, Kubernetes forums, and more.

**Base URL**: Varies per forum (e.g., `discuss.hashicorp.com`, `forum.gitlab.com`)
**Authentication**: API key (Admin > Settings > API) or anonymous read access for public forums
**Rate Limits**: 60 requests/minute (anonymous), 200/minute (authenticated)

```python
import requests
import time

class DiscourseCrawler:
    def __init__(self, base_url: str, api_key: str | None = None, api_username: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        if api_key and api_username:
            self.session.headers.update({
                "Api-Key": api_key,
                "Api-Username": api_username,
            })

    def get_categories(self) -> list[dict]:
        """List all categories on the forum."""
        resp = self.session.get(f"{self.base_url}/categories.json")
        return resp.json()["category_list"]["categories"]

    def get_topics_in_category(self, category_slug: str, page: int = 0) -> dict:
        """Get topics in a category with pagination."""
        resp = self.session.get(
            f"{self.base_url}/c/{category_slug}.json",
            params={"page": page}
        )
        return resp.json()

    def get_topic_with_posts(self, topic_id: int) -> dict:
        """Get a topic with all its posts (paginated internally)."""
        all_posts = []
        topic_data = None
        page = 0

        while True:
            resp = self.session.get(
                f"{self.base_url}/t/{topic_id}.json",
                params={"page": page}
            )
            data = resp.json()

            if topic_data is None:
                topic_data = {
                    "id": data["id"],
                    "title": data["title"],
                    "created_at": data["created_at"],
                    "views": data["views"],
                    "like_count": data["like_count"],
                    "reply_count": data["reply_count"],
                    "tags": data.get("tags", []),
                    "category_id": data.get("category_id"),
                }

            posts = data.get("post_stream", {}).get("posts", [])
            if not posts:
                break

            all_posts.extend([
                {
                    "id": p["id"],
                    "body": p["cooked"],  # HTML content
                    "raw": p.get("raw", ""),  # Markdown (if available)
                    "created_at": p["created_at"],
                    "username": p["username"],
                    "like_count": p.get("like_count", 0),
                    "reply_to_post_number": p.get("reply_to_post_number"),
                    "post_number": p["post_number"],
                    "accepted_answer": p.get("accepted_answer", False),
                }
                for p in posts
            ])

            # Check if more pages
            stream = data.get("post_stream", {}).get("stream", [])
            collected_ids = {p["id"] for p in all_posts}
            if all(pid in collected_ids for pid in stream):
                break

            page += 1
            time.sleep(0.5)

        topic_data["posts"] = all_posts
        return topic_data

    def crawl_category(self, category_slug: str, max_topics: int = 500) -> list[dict]:
        """Crawl all topics in a category."""
        topics = []
        page = 0

        while len(topics) < max_topics:
            data = self.get_topics_in_category(category_slug, page)
            topic_list = data.get("topic_list", {}).get("topics", [])

            if not topic_list:
                break

            for topic_meta in topic_list:
                if len(topics) >= max_topics:
                    break

                topic_detail = self.get_topic_with_posts(topic_meta["id"])
                topics.append(topic_detail)
                time.sleep(0.3)

            page += 1

        return topics

# Target Discourse forums for infrastructure knowledge
DISCOURSE_FORUMS = {
    "HashiCorp": "https://discuss.hashicorp.com",
    "Docker": "https://forums.docker.com",
    "Kubernetes": "https://discuss.kubernetes.io",
    "Grafana": "https://community.grafana.com",
    "Elastic": "https://discuss.elastic.co",
    "Cloudflare": "https://community.cloudflare.com",
    "DigitalOcean": "https://www.digitalocean.com/community",
}
```

---

## 2. Non-API Crawling Methods

### 2.1 Python Library Comparison

| Library | Best For | JS Support | Speed | Difficulty |
|---------|----------|------------|-------|------------|
| **Scrapy** | Large-scale static sites | No (need Splash/Playwright plugin) | Very fast (async) | Medium |
| **BeautifulSoup** | Simple one-off parsing | No | Slow (sync) | Easy |
| **Selenium** | Legacy; browser automation | Yes | Slow | Medium |
| **Playwright** | Modern JS-rendered sites | Yes | Fast | Medium |
| **Scrapy + Playwright** | Best of both worlds | Yes | Fast (async) | Higher |

**Recommendation**: Use **Scrapy** for static Q&A sites (most forum threads are static HTML). Use **Scrapy + scrapy-playwright** for sites requiring JavaScript rendering (SPAs, infinite scroll).

### 2.2 Scrapy Spider for Q&A Forums

```python
# scrapy_infra_kb/spiders/generic_qa_spider.py
import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
from datetime import datetime
import hashlib

class GenericQASpider(CrawlSpider):
    name = "generic_qa"

    # Configure per-site
    custom_settings = {
        "ROBOTSTXT_OBEY": True,
        "DOWNLOAD_DELAY": 2,           # 2 seconds between requests
        "CONCURRENT_REQUESTS": 4,       # Max 4 parallel requests
        "AUTOTHROTTLE_ENABLED": True,   # Auto-adjust speed
        "AUTOTHROTTLE_TARGET_CONCURRENCY": 2.0,
        "FEEDS": {
            "output/%(name)s_%(time)s.jsonl": {
                "format": "jsonlines",
                "encoding": "utf-8",
            },
        },
        "HTTPCACHE_ENABLED": True,      # Cache responses for dev
        "HTTPCACHE_DIR": ".scrapy_cache",
        "LOG_LEVEL": "INFO",
    }

    def __init__(self, domain=None, start_url=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if domain:
            self.allowed_domains = [domain]
        if start_url:
            self.start_urls = [start_url]

    rules = (
        Rule(LinkExtractor(allow=(r"/t/.*", r"/questions/.*", r"/topics/.*")),
             callback="parse_thread",
             follow=True),
    )

    def parse_thread(self, response):
        """Extract Q&A data from a thread page."""
        # Generic extraction -- customize selectors per site
        title = response.css("h1::text, .topic-title::text, .question-hyperlink::text").get("")

        posts = []
        for post_el in response.css(".post, .answer, .comment, article"):
            body = post_el.css(".post-body, .answercell, .message-body").get("")
            author = post_el.css(".author::text, .username::text").get("")
            score_text = post_el.css(".vote-count::text, .like-count::text").get("0")
            date_text = post_el.css("time::attr(datetime), .date::text").get("")

            posts.append({
                "body_html": body,
                "author": author.strip(),
                "score": int(score_text.strip()) if score_text.strip().lstrip("-").isdigit() else 0,
                "date": date_text.strip(),
            })

        content_hash = hashlib.sha256(
            (title + str(len(posts))).encode()
        ).hexdigest()[:16]

        yield {
            "url": response.url,
            "title": title.strip(),
            "content_hash": content_hash,
            "posts": posts,
            "crawled_at": datetime.utcnow().isoformat(),
            "source_domain": response.url.split("/")[2],
        }
```

### 2.3 Playwright for JavaScript-Rendered Content

Some modern forums (Flarum, NodeBB, custom React/Vue apps) require JavaScript execution:

```python
# For sites requiring JS rendering
import asyncio
from playwright.async_api import async_playwright

async def scrape_js_forum(url: str, scroll_count: int = 5) -> dict:
    """Scrape a JS-rendered forum page with infinite scroll handling."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="InfraKB-Crawler/1.0 (+https://infraflow.dev/crawler-info)",
            viewport={"width": 1280, "height": 720},
        )
        page = await context.new_page()

        # Block unnecessary resources to speed up crawling
        await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2}",
                         lambda route: route.abort())

        await page.goto(url, wait_until="networkidle")

        # Handle infinite scroll
        for _ in range(scroll_count):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1.5)

        # Extract content after all dynamic loading
        content = await page.evaluate("""
            () => {
                const posts = document.querySelectorAll('.post, .topic-post, article');
                return Array.from(posts).map(post => ({
                    body: post.querySelector('.post-body, .cooked, .message')?.innerHTML || '',
                    author: post.querySelector('.username, .author')?.textContent?.trim() || '',
                    date: post.querySelector('time')?.getAttribute('datetime') || '',
                }));
            }
        """)

        title = await page.title()
        await browser.close()

        return {"url": url, "title": title, "posts": content}
```

### 2.4 Handling Pagination Patterns

Different sites use different pagination approaches:

```python
class PaginationHandler:
    """Handle common pagination patterns across Q&A sites."""

    @staticmethod
    async def numbered_pages(page, base_url: str, max_pages: int = 50):
        """Standard ?page=N pagination (StackOverflow, Discourse)."""
        for p in range(1, max_pages + 1):
            url = f"{base_url}?page={p}"
            resp = await page.goto(url, wait_until="networkidle")

            # Check for empty page / redirect to page 1
            if resp.url != url and p > 1:
                break

            items = await page.query_selector_all(".question-summary, .topic-list-item")
            if not items:
                break

            yield url

    @staticmethod
    async def cursor_based(page, base_url: str, cursor_param: str = "after"):
        """Cursor-based pagination (Reddit, GitHub, some APIs)."""
        cursor = None
        while True:
            url = f"{base_url}?{cursor_param}={cursor}" if cursor else base_url
            await page.goto(url, wait_until="networkidle")

            # Extract next cursor from page
            next_link = await page.query_selector("[rel='next'], .next-page")
            if not next_link:
                break

            href = await next_link.get_attribute("href")
            # Parse cursor from href
            from urllib.parse import urlparse, parse_qs
            params = parse_qs(urlparse(href).query)
            cursor = params.get(cursor_param, [None])[0]

            if not cursor:
                break

            yield url

    @staticmethod
    async def infinite_scroll(page, max_scrolls: int = 20, wait_ms: int = 2000):
        """Infinite scroll (some modern forums, Reddit new UI)."""
        previous_height = 0
        scroll_count = 0

        while scroll_count < max_scrolls:
            current_height = await page.evaluate("document.body.scrollHeight")
            if current_height == previous_height:
                break  # No new content loaded

            previous_height = current_height
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(wait_ms)
            scroll_count += 1

        return scroll_count
```

### 2.5 robots.txt Compliance and Crawl Politeness

```python
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse
import time

class PoliteCrawler:
    """Enforce robots.txt compliance and rate limiting."""

    def __init__(self, user_agent: str = "InfraKB-Crawler/1.0"):
        self.user_agent = user_agent
        self.robot_parsers: dict[str, RobotFileParser] = {}
        self.last_request_time: dict[str, float] = {}
        self.default_delay = 2.0  # seconds

    def _get_parser(self, url: str) -> RobotFileParser:
        domain = urlparse(url).netloc
        if domain not in self.robot_parsers:
            parser = RobotFileParser()
            robots_url = f"{urlparse(url).scheme}://{domain}/robots.txt"
            parser.set_url(robots_url)
            try:
                parser.read()
            except Exception:
                pass  # If robots.txt is inaccessible, assume allow-all
            self.robot_parsers[domain] = parser
        return self.robot_parsers[domain]

    def can_fetch(self, url: str) -> bool:
        """Check if URL is allowed by robots.txt."""
        parser = self._get_parser(url)
        return parser.can_fetch(self.user_agent, url)

    def get_crawl_delay(self, url: str) -> float:
        """Get crawl delay from robots.txt or use default."""
        parser = self._get_parser(url)
        delay = parser.crawl_delay(self.user_agent)
        return delay if delay else self.default_delay

    def wait_if_needed(self, url: str):
        """Enforce crawl delay between requests to the same domain."""
        domain = urlparse(url).netloc
        delay = self.get_crawl_delay(url)

        if domain in self.last_request_time:
            elapsed = time.time() - self.last_request_time[domain]
            if elapsed < delay:
                time.sleep(delay - elapsed)

        self.last_request_time[domain] = time.time()
```

### 2.6 Proxy Rotation (for Large-Scale Crawling)

For crawling at scale across many sites, rotating proxies can help avoid IP-based rate limiting:

```python
import itertools
import random

class ProxyRotator:
    """Rotate proxies for distributed crawling."""

    def __init__(self, proxy_list: list[str]):
        # proxy_list format: ["http://user:pass@host:port", ...]
        self.proxies = proxy_list
        self._cycle = itertools.cycle(proxy_list)
        self._failed: set[str] = set()

    def get_next(self) -> str | None:
        """Get next working proxy from rotation."""
        attempts = 0
        while attempts < len(self.proxies):
            proxy = next(self._cycle)
            if proxy not in self._failed:
                return proxy
            attempts += 1
        return None  # All proxies failed

    def mark_failed(self, proxy: str):
        self._failed.add(proxy)

    def mark_recovered(self, proxy: str):
        self._failed.discard(proxy)

# Scrapy middleware integration
# In settings.py:
# DOWNLOADER_MIDDLEWARES = {
#     'scrapy_infra_kb.middlewares.ProxyMiddleware': 350,
# }
```

**Note**: Proxy rotation should only be used when necessary and within the bounds of site Terms of Service. For most Q&A sites that offer APIs, the API approach is preferred.

---

## 3. Data Extraction Patterns for Q&A Sites

### 3.1 Unified Q&A Data Model

```python
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class SourceType(Enum):
    STACK_EXCHANGE = "stack_exchange"
    REDDIT = "reddit"
    GITHUB_DISCUSSIONS = "github_discussions"
    DISCOURSE = "discourse"
    GENERIC_FORUM = "generic_forum"

@dataclass
class Author:
    username: str
    reputation: int | None = None
    profile_url: str | None = None

@dataclass
class CodeSnippet:
    language: str  # "terraform", "yaml", "bash", "python", etc.
    code: str
    context: str  # Surrounding text that explains the snippet

@dataclass
class Answer:
    answer_id: str
    body_markdown: str
    body_html: str
    author: Author
    score: int
    is_accepted: bool
    created_at: datetime
    code_snippets: list[CodeSnippet] = field(default_factory=list)
    reply_to: str | None = None  # Parent answer/comment ID for threading

@dataclass
class QADocument:
    """Unified document representing a Q&A thread from any source."""
    doc_id: str                     # Globally unique: "{source}:{original_id}"
    source: SourceType
    source_url: str
    title: str
    question_body_markdown: str
    question_body_html: str
    question_author: Author
    question_score: int
    tags: list[str]
    answers: list[Answer]
    view_count: int | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime | None = None
    code_snippets: list[CodeSnippet] = field(default_factory=list)  # From question
    content_hash: str = ""          # For deduplication

    # Computed quality signals
    @property
    def has_accepted_answer(self) -> bool:
        return any(a.is_accepted for a in self.answers)

    @property
    def best_answer_score(self) -> int:
        return max((a.score for a in self.answers), default=0)

    @property
    def quality_score(self) -> float:
        """Composite quality score (0-100) for filtering."""
        score = 0.0
        score += min(self.question_score * 2, 30)          # Question votes (max 30)
        score += min(self.best_answer_score * 3, 30)       # Best answer votes (max 30)
        score += 15 if self.has_accepted_answer else 0     # Accepted answer bonus
        score += min(len(self.answers) * 2, 10)            # Number of answers (max 10)
        score += min(len(self.code_snippets) * 3, 15)      # Code snippets (max 15)
        return min(score, 100)
```

### 3.2 Code Snippet Extraction

Preserving code snippets is critical for infrastructure Q&A. Configuration files (Terraform, YAML, Dockerfiles) and command-line examples are the most valuable content.

```python
import re
from bs4 import BeautifulSoup

# Language detection heuristics for infrastructure code
LANGUAGE_PATTERNS = {
    "terraform": [
        r'\bresource\s+"', r'\bprovider\s+"', r'\bmodule\s+"',
        r'\bvariable\s+"', r'\boutput\s+"', r'\.tf\b',
    ],
    "yaml": [
        r'^apiVersion:', r'^kind:', r'^metadata:', r'^\s+- name:',
        r'^services:', r'^version:',
    ],
    "dockerfile": [
        r'^FROM\s+', r'^RUN\s+', r'^COPY\s+', r'^EXPOSE\s+',
        r'^ENTRYPOINT\s+', r'^CMD\s+',
    ],
    "bash": [
        r'^#!/bin/(ba)?sh', r'^\$\s+', r'\bsudo\s+', r'\bapt-get\s+',
        r'\byum\s+', r'\bcurl\s+', r'\bwget\s+', r'\bkubectl\s+',
        r'\bterraform\s+', r'\bdocker\s+', r'\bansible\s+',
    ],
    "json": [r'^\s*\{', r'^\s*\['],
    "nginx": [r'\bserver\s*\{', r'\blocation\s+/', r'\bupstream\s+'],
    "cisco_ios": [
        r'^interface\s+', r'^router\s+', r'^ip\s+route\s+',
        r'^access-list\s+', r'^hostname\s+',
    ],
}

def detect_language(code: str) -> str:
    """Detect the language of an infrastructure code snippet."""
    for lang, patterns in LANGUAGE_PATTERNS.items():
        matches = sum(1 for p in patterns if re.search(p, code, re.MULTILINE))
        if matches >= 2:
            return lang
    return "unknown"

def extract_code_snippets(html_content: str) -> list[CodeSnippet]:
    """Extract code snippets from HTML content with language detection."""
    soup = BeautifulSoup(html_content, "html.parser")
    snippets = []

    for code_block in soup.find_all(["code", "pre"]):
        code_text = code_block.get_text(strip=True)

        if len(code_text) < 20:  # Skip inline code fragments
            continue

        # Check for explicit language class (e.g., class="lang-terraform")
        classes = code_block.get("class", [])
        explicit_lang = None
        for cls in classes:
            if cls.startswith(("lang-", "language-", "highlight-")):
                explicit_lang = cls.split("-", 1)[1]
                break

        language = explicit_lang or detect_language(code_text)

        # Get surrounding context (previous sibling text)
        context = ""
        prev = code_block.find_previous_sibling(["p", "li"])
        if prev:
            context = prev.get_text(strip=True)[:200]

        snippets.append(CodeSnippet(
            language=language,
            code=code_text,
            context=context,
        ))

    return snippets
```

### 3.3 Nested Comment/Thread Handling

```python
from dataclasses import dataclass, field

@dataclass
class ThreadNode:
    """A node in a comment/reply tree."""
    id: str
    parent_id: str | None
    body: str
    author: str
    score: int
    depth: int
    children: list["ThreadNode"] = field(default_factory=list)

def build_thread_tree(flat_posts: list[dict]) -> list[ThreadNode]:
    """Convert flat list of posts (with parent_id) into a tree structure."""
    nodes: dict[str, ThreadNode] = {}
    roots: list[ThreadNode] = []

    # First pass: create all nodes
    for post in flat_posts:
        node = ThreadNode(
            id=post["id"],
            parent_id=post.get("parent_id") or post.get("reply_to_post_number"),
            body=post["body"],
            author=post.get("author", ""),
            score=post.get("score", 0),
            depth=0,
        )
        nodes[node.id] = node

    # Second pass: build tree
    for node in nodes.values():
        if node.parent_id and node.parent_id in nodes:
            parent = nodes[node.parent_id]
            parent.children.append(node)
            node.depth = parent.depth + 1
        else:
            roots.append(node)

    return roots

def flatten_thread_for_kb(
    roots: list[ThreadNode],
    min_score: int = 1,
    max_depth: int = 3
) -> list[dict]:
    """Flatten thread tree into ordered list, filtering low-quality branches."""
    result = []

    def traverse(node: ThreadNode):
        if node.depth > max_depth:
            return
        if node.score < min_score and node.depth > 0:
            return

        result.append({
            "id": node.id,
            "body": node.body,
            "author": node.author,
            "score": node.score,
            "depth": node.depth,
            "is_root": node.depth == 0,
        })

        # Sort children by score (best first)
        for child in sorted(node.children, key=lambda c: c.score, reverse=True):
            traverse(child)

    for root in roots:
        traverse(root)

    return result
```

### 3.4 Deduplication Strategies

```python
import hashlib
from collections import defaultdict

class ContentDeduplicator:
    """Detect and remove duplicate Q&A content across sources."""

    def __init__(self):
        self.exact_hashes: set[str] = set()         # SHA-256 of normalized text
        self.title_hashes: dict[str, list[str]] = defaultdict(list)  # For near-dupes

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text for comparison."""
        import re
        text = text.lower()
        text = re.sub(r'\s+', ' ', text)           # Collapse whitespace
        text = re.sub(r'[^\w\s]', '', text)         # Remove punctuation
        text = re.sub(r'\b(the|a|an|is|are|was|were)\b', '', text)  # Stop words
        return text.strip()

    def content_hash(self, text: str) -> str:
        normalized = self.normalize_text(text)
        return hashlib.sha256(normalized.encode()).hexdigest()

    def is_exact_duplicate(self, doc: "QADocument") -> bool:
        """Check for exact content duplicate."""
        h = self.content_hash(doc.question_body_markdown)
        if h in self.exact_hashes:
            return True
        self.exact_hashes.add(h)
        return False

    def find_near_duplicates(self, doc: "QADocument", threshold: float = 0.85) -> list[str]:
        """Find near-duplicate documents using title similarity."""
        title_hash = self.content_hash(doc.title)

        # Simple n-gram Jaccard similarity for titles
        def ngrams(text: str, n: int = 3) -> set[str]:
            normalized = self.normalize_text(text)
            return {normalized[i:i+n] for i in range(len(normalized) - n + 1)}

        doc_ngrams = ngrams(doc.title)
        matches = []

        for existing_id, existing_title_ngrams in self.title_hashes.items():
            if not doc_ngrams or not existing_title_ngrams:
                continue
            intersection = doc_ngrams & set(existing_title_ngrams)
            union = doc_ngrams | set(existing_title_ngrams)
            similarity = len(intersection) / len(union) if union else 0

            if similarity >= threshold:
                matches.append(existing_id)

        # Register this document
        self.title_hashes[doc.doc_id] = list(ngrams(doc.title))

        return matches

    @staticmethod
    def simhash(text: str, hash_bits: int = 64) -> int:
        """Compute SimHash for near-duplicate detection at scale.

        SimHash is more efficient than Jaccard for large corpora
        because it produces a fixed-size fingerprint.
        """
        import hashlib

        tokens = text.lower().split()
        v = [0] * hash_bits

        for token in tokens:
            token_hash = int(hashlib.md5(token.encode()).hexdigest(), 16)
            for i in range(hash_bits):
                if token_hash & (1 << i):
                    v[i] += 1
                else:
                    v[i] -= 1

        fingerprint = 0
        for i in range(hash_bits):
            if v[i] > 0:
                fingerprint |= (1 << i)

        return fingerprint

    @staticmethod
    def hamming_distance(h1: int, h2: int) -> int:
        """Count differing bits between two SimHash fingerprints."""
        return bin(h1 ^ h2).count("1")
```

---

## 4. Legal and Ethical Considerations

### 4.1 robots.txt Compliance

**Status**: Not legally binding in most jurisdictions, but increasingly treated as a signal of intent by regulators.

- **France (CNIL)**: Considers robots.txt compliance a key factor in the "Legitimate Interest" balancing test under GDPR.
- **US**: The hiQ Labs v. LinkedIn (2022) case established that scraping publicly available data does not violate the CFAA, but did not address robots.txt specifically.
- **Best practice**: Always obey robots.txt. If a site blocks your crawler, respect it.

### 4.2 Terms of Service by Platform

| Platform | ToS Position on Scraping | License | Practical Approach |
|----------|--------------------------|---------|-------------------|
| **StackExchange** | Content is CC BY-SA 4.0. Data dumps explicitly provided. Recent ToS adds restriction against AI training (controversial, may conflict with CC license). | CC BY-SA 4.0 | Use data dumps (cleanest legal path). API for incremental updates. |
| **Reddit** | Prohibits scraping without approval. API requires paid access for commercial use. | User content has no explicit open license. Reddit claims license to user content in ToS. | Use Arctic Shift for historical data. Limited API for real-time. |
| **GitHub** | Allows scraping of public data via API. Rate-limited. ToS prohibits excessive automated access. | Varies per repo (check LICENSE file). Discussions content has no separate license. | Use GraphQL API within rate limits. |
| **Discourse forums** | Varies per forum. Most public forums allow read access. Check individual site ToS. | Varies. Some forums are CC-licensed. | Check per-site robots.txt and ToS. API preferred over scraping. |

### 4.3 License Compatibility

For building a knowledge base, the safest content sources are:
1. **CC BY-SA 4.0** (StackExchange) -- Must attribute, share-alike
2. **CC BY 4.0** -- Must attribute, no share-alike requirement
3. **CC0 / Public Domain** -- No restrictions
4. **MIT/Apache licensed docs** -- Most permissive for code/config examples

### 4.4 GDPR and Korean Privacy Law Considerations

**GDPR (EU)**:
- Scraped personal data (usernames, email addresses) requires a legal basis
- Legitimate interest can apply but requires a documented balancing test
- Data subjects must be informed within 30 days of collection (practically difficult for web scraping)
- **Mitigation**: Anonymize or pseudonymize all personal data. Strip usernames, replace with hashes.

**Korean Personal Information Protection Act (PIPA / 개인정보보호법)**:
- Similar to GDPR in scope. Requires consent for personal information processing.
- Public posts on forums are generally not considered "personal information" unless they contain identifying details.
- **Mitigation**: Same as GDPR -- strip PII, focus on technical content only.

```python
import re

def anonymize_qa_document(doc: dict) -> dict:
    """Strip personally identifiable information from a Q&A document."""
    pii_patterns = [
        (r'\b[\w.+-]+@[\w-]+\.[\w.-]+\b', '[EMAIL]'),          # Email
        (r'\b\d{3}[-.]?\d{3,4}[-.]?\d{4}\b', '[PHONE]'),       # Phone (US/KR)
        (r'\b(?:0[1-9]{1,2})-?\d{3,4}-?\d{4}\b', '[PHONE_KR]'),  # Korean phone
        (r'\b\d{6}-?\d{7}\b', '[RRN]'),                         # Korean resident number
        (r'\b(?:\d{1,3}\.){3}\d{1,3}\b', '[IP_ADDR]'),          # IP address (keep for infra? configurable)
        (r'(?:password|passwd|pwd)\s*[=:]\s*\S+', '[CREDENTIAL]'),
        (r'(?:api[_-]?key|secret|token)\s*[=:]\s*["\']?\S+', '[API_KEY]'),
    ]

    def scrub(text: str) -> str:
        for pattern, replacement in pii_patterns:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        return text

    doc["question_body"] = scrub(doc.get("question_body", ""))
    doc["author"] = hashlib.sha256(doc.get("author", "").encode()).hexdigest()[:8]

    for answer in doc.get("answers", []):
        answer["body"] = scrub(answer.get("body", ""))
        answer["author"] = hashlib.sha256(answer.get("author", "").encode()).hexdigest()[:8]

    return doc
```

### 4.5 Fair Use and AI Training

The legal landscape for using scraped data for AI training is evolving rapidly:

- **EU AI Act (2024)**: Requires documentation of training data sources. High-risk AI systems must demonstrate data provenance.
- **US Copyright**: Fair use analysis applies. Transformative use (training a model) may be defensible but is actively litigated (NYT v. OpenAI, etc.).
- **Japan**: Most permissive -- allows use of copyrighted works for AI training under Article 30-4 of the Copyright Act.
- **Korea (한국)**: No specific AI training exception yet. Standard copyright rules apply. Fair use defense is available under Article 35-5 of the Copyright Act.

**Safest approach for InfraFlow**: Focus on CC-licensed content (StackExchange dumps), public documentation, and content obtained through official APIs with explicit permission.

---

## 5. Data Quality and Filtering

### 5.1 Multi-Signal Quality Scoring

```python
from dataclasses import dataclass
from enum import Enum

class QualityTier(Enum):
    GOLD = "gold"         # Score >= 80: Authoritative, well-voted, accepted
    SILVER = "silver"     # Score >= 50: Good quality, useful
    BRONZE = "bronze"     # Score >= 25: Acceptable, may need verification
    FILTERED = "filtered" # Score < 25: Too low quality for KB

@dataclass
class QualityAssessment:
    overall_score: float  # 0-100
    tier: QualityTier
    signals: dict[str, float]
    reasons: list[str]

def assess_quality(doc: "QADocument") -> QualityAssessment:
    """Multi-signal quality assessment for a Q&A document."""
    signals = {}
    reasons = []

    # 1. Vote-based signals (max 30 points)
    q_vote_score = min(doc.question_score * 1.5, 15)
    a_vote_score = min(doc.best_answer_score * 2, 15)
    signals["question_votes"] = q_vote_score
    signals["answer_votes"] = a_vote_score

    # 2. Accepted answer (15 points)
    accepted_score = 15 if doc.has_accepted_answer else 0
    signals["accepted_answer"] = accepted_score
    if doc.has_accepted_answer:
        reasons.append("Has accepted answer")

    # 3. Answer diversity (max 10 points)
    answer_count_score = min(len(doc.answers) * 2, 10)
    signals["answer_diversity"] = answer_count_score

    # 4. Code content (max 15 points -- infrastructure KB values config examples)
    code_score = min(len(doc.code_snippets) * 5, 15)
    signals["code_content"] = code_score
    if doc.code_snippets:
        reasons.append(f"{len(doc.code_snippets)} code snippet(s)")

    # 5. Tag relevance (max 10 points)
    INFRA_TAGS = {
        "networking", "firewall", "load-balancer", "dns", "vpn", "ssl",
        "aws", "azure", "gcp", "kubernetes", "docker", "terraform",
        "cisco", "routing", "switching", "vlan", "bgp", "ospf",
        "high-availability", "disaster-recovery", "monitoring",
        "nginx", "apache", "linux", "windows-server",
    }
    matching_tags = set(t.lower() for t in doc.tags) & INFRA_TAGS
    tag_score = min(len(matching_tags) * 3, 10)
    signals["tag_relevance"] = tag_score
    if matching_tags:
        reasons.append(f"Relevant tags: {', '.join(matching_tags)}")

    # 6. Author reputation (max 10 points)
    rep = doc.question_author.reputation or 0
    rep_score = min(rep / 1000, 10)  # 10k+ rep = full score
    signals["author_reputation"] = rep_score

    # 7. Freshness (max 10 points)
    from datetime import datetime, timedelta
    age_days = (datetime.utcnow() - doc.created_at).days
    freshness_score = max(10 - (age_days / 365), 0)  # Decay over years
    signals["freshness"] = freshness_score

    overall = sum(signals.values())

    # Determine tier
    if overall >= 80:
        tier = QualityTier.GOLD
    elif overall >= 50:
        tier = QualityTier.SILVER
    elif overall >= 25:
        tier = QualityTier.BRONZE
    else:
        tier = QualityTier.FILTERED

    return QualityAssessment(
        overall_score=min(overall, 100),
        tier=tier,
        signals=signals,
        reasons=reasons,
    )
```

### 5.2 Spam and Low-Quality Detection

```python
import re

def detect_low_quality(text: str) -> tuple[bool, list[str]]:
    """Detect spam and low-quality content in Q&A posts."""
    issues = []

    # 1. Too short to be useful
    if len(text.strip()) < 50:
        issues.append("too_short")

    # 2. Excessive links (spam indicator)
    link_count = len(re.findall(r'https?://\S+', text))
    if link_count > 5 and len(text) < 500:
        issues.append("link_spam")

    # 3. "Me too" / "Same problem" non-answers
    me_too_patterns = [
        r'\bme\s+too\b', r'\bsame\s+(problem|issue|here)\b',
        r'\b(bump|following|subscribe)\b', r'^\+1$',
        r'\bthanks?\b.*\bworked?\b',  # "Thanks, that worked"
    ]
    for pattern in me_too_patterns:
        if re.search(pattern, text, re.IGNORECASE) and len(text) < 100:
            issues.append("me_too_post")
            break

    # 4. Promotional content
    promo_patterns = [
        r'\bcheck\s+out\s+my\b', r'\bvisit\s+(my|our)\s+(site|blog|channel)\b',
        r'\bdiscount|coupon|promo\s+code\b',
        r'\bfree\s+trial\b.*\bsign\s+up\b',
    ]
    for pattern in promo_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            issues.append("promotional")
            break

    # 5. Non-English detection (simple heuristic)
    # For InfraFlow, we want English and Korean content
    ascii_ratio = sum(1 for c in text if ord(c) < 128) / max(len(text), 1)
    korean_chars = len(re.findall(r'[\uAC00-\uD7A3]', text))
    if ascii_ratio < 0.5 and korean_chars == 0:
        issues.append("non_target_language")

    is_low_quality = len(issues) > 0
    return is_low_quality, issues
```

### 5.3 Technical Accuracy Validation

For infrastructure content, automated accuracy validation is challenging but some heuristics help:

```python
def validate_infra_content(doc: "QADocument") -> dict:
    """Basic validation checks for infrastructure Q&A content."""
    validation = {
        "has_config_examples": False,
        "references_official_docs": False,
        "mentions_specific_versions": False,
        "has_error_messages": False,
        "contradicts_best_practices": False,
    }

    full_text = doc.question_body_markdown
    for ans in doc.answers:
        full_text += " " + ans.body_markdown

    # Config examples are high-value
    config_patterns = [
        r'```(?:terraform|yaml|json|hcl|nginx|dockerfile)',
        r'^\s*(?:resource|provider|module)\s+"',
        r'^\s*apiVersion:',
        r'^\s*(?:server|location|upstream)\s*\{',
    ]
    validation["has_config_examples"] = any(
        re.search(p, full_text, re.MULTILINE) for p in config_patterns
    )

    # References to official documentation
    doc_domains = [
        "docs.aws.amazon.com", "learn.microsoft.com", "cloud.google.com/docs",
        "kubernetes.io/docs", "terraform.io/docs", "nginx.org/en/docs",
        "developer.cisco.com", "docs.paloaltonetworks.com",
        "rfc-editor.org", "tools.ietf.org/html/rfc",
    ]
    validation["references_official_docs"] = any(
        domain in full_text for domain in doc_domains
    )

    # Version specificity (more reliable answers mention versions)
    version_patterns = [
        r'v?\d+\.\d+(?:\.\d+)?',
        r'(?:version|release)\s+\d+',
        r'(?:AWS|Azure|GCP)\s+\w+\s+v\d+',
    ]
    validation["mentions_specific_versions"] = any(
        re.search(p, full_text, re.IGNORECASE) for p in version_patterns
    )

    # Error messages (indicates real troubleshooting)
    error_patterns = [
        r'(?:error|exception|failed|denied|timeout|refused)',
        r'(?:status\s+code|exit\s+code)\s+\d+',
        r'(?:FATAL|ERROR|WARN)\s*[:\[]',
    ]
    validation["has_error_messages"] = any(
        re.search(p, full_text, re.IGNORECASE) for p in error_patterns
    )

    return validation
```

---

## 6. Storage and Processing Pipeline

### 6.1 Pipeline Architecture

```
                                    +------------------+
                                    |   Data Sources   |
                                    +------------------+
                                    | SE API / Dumps   |
                                    | Reddit / Arctic  |
                                    | GitHub GraphQL   |
                                    | Discourse APIs   |
                                    | Web Crawlers     |
                                    +--------+---------+
                                             |
                                             v
                                    +------------------+
                                    |  1. COLLECT      |
                                    +------------------+
                                    | Source adapters   |
                                    | Rate limiting     |
                                    | robots.txt check  |
                                    +--------+---------+
                                             |
                                             v
                                    +------------------+
                                    |  2. NORMALIZE    |
                                    +------------------+
                                    | -> QADocument     |
                                    | HTML -> Markdown  |
                                    | Extract snippets  |
                                    | Anonymize PII     |
                                    +--------+---------+
                                             |
                                             v
                                    +------------------+
                                    |  3. DEDUPLICATE  |
                                    +------------------+
                                    | Exact hash check  |
                                    | SimHash near-dupe |
                                    | Cross-source merge|
                                    +--------+---------+
                                             |
                                             v
                                    +------------------+
                                    |  4. QUALITY      |
                                    +------------------+
                                    | Score (0-100)     |
                                    | Tier assignment   |
                                    | Spam filtering    |
                                    | Accuracy checks   |
                                    +--------+---------+
                                             |
                                             v
                                    +------------------+
                                    |  5. ENRICH       |
                                    +------------------+
                                    | Tag normalization |
                                    | Category mapping  |
                                    | Snippet languages |
                                    | Relationship IDs  |
                                    +--------+---------+
                                             |
                                             v
                               +-------------+-------------+
                               |                           |
                               v                           v
                      +------------------+        +------------------+
                      | 6a. RAW STORE    |        | 6b. INDEX STORE  |
                      +------------------+        +------------------+
                      | Parquet (S3)     |        | Search index     |
                      | Full documents   |        | Embeddings (vec) |
                      | Append-only      |        | SQLite / PG      |
                      +------------------+        +------------------+
```

### 6.2 Raw Storage: JSON Lines + Parquet

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
from datetime import datetime

class CrawlStorage:
    """Two-tier storage: JSONL for raw ingestion, Parquet for analytics."""

    def __init__(self, base_dir: str = "./crawl_data"):
        self.base_dir = Path(base_dir)
        self.raw_dir = self.base_dir / "raw"      # JSONL files
        self.processed_dir = self.base_dir / "processed"  # Parquet files
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def write_raw(self, source: str, documents: list[dict]):
        """Append documents to source-specific JSONL file."""
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        filepath = self.raw_dir / f"{source}_{date_str}.jsonl"

        with open(filepath, "a", encoding="utf-8") as f:
            for doc in documents:
                doc["_crawled_at"] = datetime.utcnow().isoformat()
                f.write(json.dumps(doc, ensure_ascii=False, default=str) + "\n")

    def convert_to_parquet(self, source: str, date_str: str):
        """Convert a day's JSONL to Parquet for efficient analytics."""
        jsonl_path = self.raw_dir / f"{source}_{date_str}.jsonl"
        if not jsonl_path.exists():
            return

        records = []
        with open(jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                records.append(json.loads(line))

        # Flatten for Parquet (answers become a JSON string column)
        flat_records = []
        for r in records:
            flat_records.append({
                "doc_id": r.get("doc_id", ""),
                "source": r.get("source", source),
                "title": r.get("title", ""),
                "question_body": r.get("question_body_markdown", r.get("body", "")),
                "question_score": r.get("question_score", r.get("score", 0)),
                "tags": json.dumps(r.get("tags", [])),
                "answer_count": len(r.get("answers", [])),
                "best_answer_score": max(
                    (a.get("score", 0) for a in r.get("answers", [])), default=0
                ),
                "has_accepted_answer": any(
                    a.get("is_accepted", False) for a in r.get("answers", [])
                ),
                "has_code": bool(r.get("code_snippets")),
                "created_at": r.get("created_at", ""),
                "crawled_at": r.get("_crawled_at", ""),
                "source_url": r.get("source_url", r.get("url", "")),
                "quality_score": r.get("quality_score", 0),
                "answers_json": json.dumps(r.get("answers", [])),  # Nested data as JSON string
            })

        table = pa.Table.from_pylist(flat_records)

        # Partition by source and month for efficient querying
        month_str = date_str[:7]  # YYYY-MM
        output_path = self.processed_dir / f"source={source}" / f"month={month_str}"
        output_path.mkdir(parents=True, exist_ok=True)

        pq.write_table(
            table,
            output_path / f"{date_str}.parquet",
            compression="snappy",
        )
```

### 6.3 Incremental Crawling

```python
import json
import hashlib
from pathlib import Path
from datetime import datetime, timedelta

class IncrementalCrawlState:
    """Track crawl state for incremental updates (only fetch new/updated content)."""

    def __init__(self, state_file: str = "./crawl_state.json"):
        self.state_file = Path(state_file)
        self.state = self._load()

    def _load(self) -> dict:
        if self.state_file.exists():
            return json.loads(self.state_file.read_text())
        return {"sources": {}}

    def _save(self):
        self.state_file.write_text(json.dumps(self.state, indent=2, default=str))

    def get_last_crawl(self, source: str) -> datetime | None:
        """Get the timestamp of the last successful crawl for a source."""
        ts = self.state.get("sources", {}).get(source, {}).get("last_crawl")
        return datetime.fromisoformat(ts) if ts else None

    def get_last_id(self, source: str) -> str | None:
        """Get the last processed document ID (for cursor-based pagination)."""
        return self.state.get("sources", {}).get(source, {}).get("last_id")

    def update(self, source: str, last_id: str | None = None, doc_count: int = 0):
        """Record a successful crawl."""
        if source not in self.state["sources"]:
            self.state["sources"][source] = {}

        self.state["sources"][source].update({
            "last_crawl": datetime.utcnow().isoformat(),
            "last_id": last_id,
            "total_docs": self.state["sources"][source].get("total_docs", 0) + doc_count,
        })
        self._save()

    def should_recrawl(self, source: str, interval_hours: int = 24) -> bool:
        """Check if enough time has passed since last crawl."""
        last = self.get_last_crawl(source)
        if last is None:
            return True
        return datetime.utcnow() - last > timedelta(hours=interval_hours)

# Usage with StackExchange API
def incremental_stackexchange_crawl(
    crawler: "StackExchangeCrawler",
    state: IncrementalCrawlState,
    site: str = "serverfault",
    tags: list[str] = None,
):
    """Only fetch questions created/modified since last crawl."""
    last_crawl = state.get_last_crawl(f"se_{site}")

    params = {
        "order": "desc",
        "sort": "activity",
        "site": site,
        "pagesize": 100,
    }

    if last_crawl:
        params["fromdate"] = int(last_crawl.timestamp())

    if tags:
        params["tagged"] = ";".join(tags)

    # Fetch only new/updated questions
    new_questions = crawler._request("/questions", params)

    doc_count = len(new_questions.get("items", []))
    last_id = new_questions["items"][0]["question_id"] if new_questions.get("items") else None

    state.update(f"se_{site}", last_id=str(last_id), doc_count=doc_count)

    return new_questions.get("items", [])
```

### 6.4 Metadata Enrichment Pipeline

```python
def enrich_document(doc: "QADocument", knowledge_graph: dict) -> dict:
    """Enrich a Q&A document with InfraFlow knowledge graph mappings.

    Maps community tags and content to InfraFlow's ontology:
    - infraNodeTypes (from src/types/infra.ts)
    - knowledge graph relationships
    - vendor catalog product references
    - cloud service references
    """

    # Tag normalization: community tags -> InfraFlow types
    TAG_TO_INFRA_TYPE = {
        "firewall": "firewall",
        "load-balancer": "load-balancer",
        "load-balancing": "load-balancer",
        "nginx": "reverse-proxy",
        "dns": "dns",
        "vpn": "vpn",
        "kubernetes": "kubernetes",
        "k8s": "kubernetes",
        "docker": "docker",
        "aws-vpc": "vpc",
        "route53": "dns",
        "cloudfront": "cdn",
        "s3": "object-storage",
        "ec2": "vm",
        "rds": "database",
        "elastic-load-balancing": "load-balancer",
        "bgp": "router",
        "ospf": "router",
        "vlan": "switch",
        "ssl": "waf",
        "waf": "waf",
        "active-directory": "active-directory",
        "ldap": "ldap",
    }

    # Map tags to infra types
    infra_types = set()
    for tag in doc.tags:
        normalized = tag.lower().strip()
        if normalized in TAG_TO_INFRA_TYPE:
            infra_types.add(TAG_TO_INFRA_TYPE[normalized])

    # Map to vendor products (if mentioned in content)
    VENDOR_KEYWORDS = {
        "cisco": ["asa", "meraki", "nexus", "catalyst", "isr", "asr"],
        "fortinet": ["fortigate", "fortianalyzer", "fortiweb", "fortimanager"],
        "paloalto": ["pa-", "panorama", "prisma", "cortex"],
        "arista": ["eos", "cloudvision", "7050", "7060"],
    }

    mentioned_vendors = set()
    full_text = (doc.question_body_markdown + " " +
                 " ".join(a.body_markdown for a in doc.answers)).lower()

    for vendor, keywords in VENDOR_KEYWORDS.items():
        if any(kw in full_text for kw in keywords):
            mentioned_vendors.add(vendor)

    # Map to cloud services
    CLOUD_KEYWORDS = {
        "aws": ["ec2", "s3", "rds", "lambda", "vpc", "ecs", "eks", "cloudfront", "route53"],
        "azure": ["azure vm", "blob storage", "cosmos", "aks", "azure sql", "application gateway"],
        "gcp": ["gce", "gcs", "cloud sql", "gke", "cloud run", "cloud cdn"],
    }

    mentioned_clouds = set()
    for provider, keywords in CLOUD_KEYWORDS.items():
        if any(kw in full_text for kw in keywords):
            mentioned_clouds.add(provider)

    return {
        **doc.__dict__,
        "infra_types": list(infra_types),
        "mentioned_vendors": list(mentioned_vendors),
        "mentioned_clouds": list(mentioned_clouds),
        "enriched_at": datetime.utcnow().isoformat(),
    }
```

---

## 7. Practical Tools and Services

### 7.1 Common Crawl

**What**: Open repository of pre-crawled web data. Monthly crawls of ~2.5 billion pages.
**URL**: `commoncrawl.org`
**Format**: WARC files on Amazon S3 (free to access)
**Size**: ~400 TiB uncompressed per monthly crawl

**Use for InfraFlow**: Extract pages from infrastructure-related domains without running your own crawler.

```python
import gzip
import json
from urllib.parse import urlparse

# Step 1: Query the Common Crawl Index for relevant URLs
# The columnar index allows filtering by domain
def query_cc_index(domain: str, crawl_id: str = "CC-MAIN-2025-51") -> list[dict]:
    """Query Common Crawl index for pages from a specific domain."""
    import requests

    index_url = f"https://index.commoncrawl.org/{crawl_id}-index"
    params = {
        "url": f"{domain}/*",
        "output": "json",
        "limit": 1000,
    }

    resp = requests.get(index_url, params=params)
    results = [json.loads(line) for line in resp.text.strip().split("\n") if line]
    return results

# Step 2: Fetch specific pages from WARC files
def fetch_from_warc(warc_filename: str, offset: int, length: int) -> bytes:
    """Fetch a specific page from a Common Crawl WARC file on S3."""
    import requests

    s3_url = f"https://data.commoncrawl.org/{warc_filename}"
    headers = {"Range": f"bytes={offset}-{offset + length - 1}"}

    resp = requests.get(s3_url, headers=headers)
    return gzip.decompress(resp.content)

# Target domains for infrastructure knowledge
CC_TARGET_DOMAINS = [
    "serverfault.com",
    "networkengineering.stackexchange.com",
    "discuss.hashicorp.com",
    "forum.gitlab.com",
    "community.cloudflare.com",
    "docs.aws.amazon.com",
    "learn.microsoft.com",
    "cloud.google.com",
]
```

### 7.2 Pushshift / Arctic Shift (Reddit Archives)

**Pushshift**: Historical Reddit data archive (2005-2023). Real-time ingestion stopped after Reddit API changes. Historical dumps remain available on Internet Archive and Academic Torrents.

**Arctic Shift** (recommended successor):
- **URL**: `arctic-shift.photon-reddit.com`
- **GitHub**: `github.com/ArthurHeitmann/arctic_shift`
- **Data**: Reddit posts and comments, searchable by subreddit, author, date, keywords
- **Format**: Zstandard-compressed NDJSON
- **Coverage**: 2005 to present (with gaps)
- **Access methods**: Web search UI, API, bulk dump downloads

Academic Torrents hosts the complete Pushshift archive from 2005-06 to 2022-12 at:
`academictorrents.com/details/c398a571976c78d346c325bd75c47b82edf6124e`

### 7.3 Archive.org Wayback Machine API

Useful for accessing historical versions of forum pages and documentation:

```python
import requests

def get_wayback_snapshots(url: str, limit: int = 10) -> list[dict]:
    """Get available snapshots of a URL from the Wayback Machine."""
    cdx_url = "https://web.archive.org/cdx/search/cdx"
    params = {
        "url": url,
        "output": "json",
        "limit": limit,
        "fl": "timestamp,original,statuscode,digest",
        "filter": "statuscode:200",
    }

    resp = requests.get(cdx_url, params=params)
    data = resp.json()

    if len(data) < 2:
        return []

    headers = data[0]
    return [
        dict(zip(headers, row))
        for row in data[1:]
    ]

def fetch_wayback_page(url: str, timestamp: str) -> str:
    """Fetch a specific snapshot from the Wayback Machine."""
    wayback_url = f"https://web.archive.org/web/{timestamp}/{url}"
    resp = requests.get(wayback_url)
    return resp.text

# Example: Get historical versions of a Cisco documentation page
snapshots = get_wayback_snapshots("https://www.cisco.com/c/en/us/support/docs/")
```

### 7.4 Google Dataset Search

Pre-existing datasets related to infrastructure Q&A:

**Search URL**: `datasetsearch.research.google.com`

Notable datasets:
- **StackOverflow Annual Developer Survey** (annual, structured CSV)
- **GHTorrent** (GitHub event data, includes issues and discussions)
- **SOTorrent** (StackOverflow post history with edit tracking)
- **Google Cloud Public Datasets** (BigQuery, includes GitHub activity and StackOverflow)

```sql
-- BigQuery: Query StackOverflow data directly (free tier: 1 TB/month)
SELECT
    q.id AS question_id,
    q.title,
    q.body AS question_body,
    q.score AS question_score,
    q.tags,
    q.creation_date,
    a.id AS answer_id,
    a.body AS answer_body,
    a.score AS answer_score,
    a.is_accepted
FROM
    `bigquery-public-data.stackoverflow.posts_questions` q
JOIN
    `bigquery-public-data.stackoverflow.posts_answers` a
    ON q.accepted_answer_id = a.id
WHERE
    (q.tags LIKE '%networking%'
     OR q.tags LIKE '%firewall%'
     OR q.tags LIKE '%aws%'
     OR q.tags LIKE '%kubernetes%'
     OR q.tags LIKE '%terraform%'
     OR q.tags LIKE '%cisco%')
    AND q.score >= 5
    AND a.score >= 3
ORDER BY
    q.score DESC
LIMIT 10000;
```

---

## 8. Recommended Architecture for InfraFlow

### 8.1 Priority Ranking of Sources

| Priority | Source | Method | Volume Estimate | Legal Safety |
|----------|--------|--------|-----------------|--------------|
| 1 | StackExchange Data Dumps | Quarterly download | ~2M infra Q&A pairs | High (CC BY-SA 4.0) |
| 2 | StackExchange API | Incremental (daily) | ~500 new/day | High (official API) |
| 3 | Discourse Forums (HashiCorp, K8s, Docker) | API crawl | ~100K topics total | Medium (check per-forum) |
| 4 | GitHub Discussions (terraform, k8s repos) | GraphQL API | ~50K discussions | High (official API) |
| 5 | Reddit Archives (Arctic Shift) | Bulk download | ~500K posts | Medium (archive, no TOS issue) |
| 6 | Common Crawl | Extract from existing crawl | Variable | High (public data) |
| 7 | Official Documentation | Scrapy + sitemap | ~10K pages/vendor | Medium (check each site) |

### 8.2 Suggested Implementation Phases

**Phase 1 (Quick Win)**: StackExchange dumps + BigQuery
- Download Server Fault, Network Engineering, and SO tag subsets
- Filter by infra tags, score >= 5, with accepted answers
- Convert to QADocument format, store as Parquet
- Estimated yield: ~500K high-quality Q&A pairs

**Phase 2 (API Enrichment)**: StackExchange API + Discourse
- Set up incremental crawling for daily updates
- Crawl top 5 Discourse forums (HashiCorp, K8s, Docker, Cloudflare, Grafana)
- Link Q&A content to InfraFlow's knowledge graph types

**Phase 3 (Broadening)**: GitHub Discussions + Reddit Archives
- Crawl discussions from top 20 infrastructure repos
- Process Arctic Shift dumps for r/networking, r/sysadmin, r/aws, etc.
- Cross-source deduplication

**Phase 4 (Advanced)**: Embeddings + RAG
- Generate embeddings for all Q&A documents
- Build vector index for semantic search
- Integrate with InfraFlow's knowledge enrichment pipeline (`enrichContext()`)
- Enable RAG-based answers to infrastructure questions

### 8.3 Estimated Resource Requirements

| Component | Tool | Cost Estimate |
|-----------|------|---------------|
| StackExchange dumps | Academic Torrents | Free (storage: ~50 GB compressed) |
| BigQuery queries | Google Cloud | Free tier (1 TB/month) |
| API crawling (SE + Discourse) | Self-hosted Python | ~$10/mo (small VM or serverless) |
| Storage (Parquet on S3) | AWS S3 | ~$5/mo (100 GB) |
| Vector embeddings | OpenAI ada-002 or local model | ~$50 one-time for 500K docs |
| Vector index | Pinecone / pgvector / Qdrant | Free tier or ~$20/mo |

---

## Sources

- [StackExchange API Essentials](https://rollout.com/integration-guides/stack-exchange/api-essentials)
- [StackExchange Data Dump on Academic Torrents (2025-12-31)](https://academictorrents.com/details/0d1d597fa7809f0e85f127b5eb3088219ddbad39)
- [StackExchange Creative Commons Data on Internet Archive](https://stackoverflow.blog/2014/01/23/stack-exchange-cc-data-now-hosted-by-the-internet-archive/)
- [StackExchange restricts access to dump (CC license controversy)](https://devclass.com/2024/07/30/stack-exchange-restricts-access-to-dump-of-user-contributed-data-as-critics-complain-license-permits-reuse-for-any-purpose/)
- [Reddit Data API Wiki](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)
- [Reddit API Cost 2025 Explained](https://sellbery.com/blog/how-much-does-the-reddit-api-cost-in-2025/)
- [Reddit 2025 API Crackdown: Pre-Approval Required](https://replydaddy.com/blog/reddit-api-pre-approval-2025-personal-projects-crackdown)
- [Arctic Shift GitHub (Pushshift Successor)](https://github.com/ArthurHeitmann/arctic_shift)
- [GitHub GraphQL API for Discussions](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)
- [Discourse API Documentation](https://docs.discourse.org/)
- [Discourse REST API Examples](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354)
- [Common Crawl](https://commoncrawl.org/)
- [Common Crawl September 2025 Archive](https://commoncrawl.org/blog/september-2025-crawl-archive-now-available)
- [Scrapy vs Playwright Comparison](https://brightdata.com/blog/web-data/scrapy-vs-playwright)
- [Python Web Scraping Libraries 2025](https://dasroot.net/posts/2025/12/python-web-scraping-beautiful-soup/)
- [Playwright Web Scraping Guide 2026](https://oxylabs.io/blog/playwright-web-scraping)
- [Web Scraping Compliance 2025: GDPR, CCPA & AI Laws](https://www.xbyte.io/the-future-of-web-scraping-compliance-navigating-gdpr-ccpa-and-ai-laws-in-2025/)
- [Web Scraping Legal Issues 2025 Guide](https://groupbwt.com/blog/is-web-scraping-legal/)
- [CNIL Guidelines on AI Training Data via Web Scraping](https://www.hoganlovells.com/en/publications/development-of-an-ai-system-cnil-issues-guidelines-regarding-collection-of-data-via-web-scraping)
- [Scraping AI Training Data Legal Challenges](https://www.taylorwessing.com/en/insights-and-events/insights/2025/02/scraping-and-processing-ai-training-data)
- [Reddit Archive Tools Comparison](https://viewdeletedreddit.com/blog/reddit-archive-tools-comparison)
