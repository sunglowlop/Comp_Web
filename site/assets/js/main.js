// 工具函数
function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return document.querySelectorAll(sel);
}

// 设置年份
function setYear() {
  const yearEl = qs("#year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// 导航栏滚动效果
function initNavbar() {
  const navbar = qs(".navbar-custom");
  if (!navbar) return;

  function getNavHeight() {
    return Math.ceil(navbar.getBoundingClientRect().height);
  }

  function syncNavbarHeight() {
    document.documentElement.style.setProperty("--navbar-height", getNavHeight() + "px");
  }
  syncNavbarHeight();
  window.addEventListener("resize", syncNavbarHeight);

  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  });

  // 平滑滚动：跳转后与导航栏底对齐
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "") return;

      const target = qs(href);
      if (target) {
        e.preventDefault();
        const navH = getNavHeight();
        const top = target.getBoundingClientRect().top + window.pageYOffset - navH;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: "smooth",
        });

        // 移动端关闭菜单
        const navCollapse = qs("#mainNav");
        if (navCollapse && navCollapse.classList.contains("show")) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });

  // 带 hash 直接打开页面时也对齐到导航栏下
  if (location.hash) {
    const target = qs(location.hash);
    if (target) {
      setTimeout(function () {
        syncNavbarHeight();
        const navH = getNavHeight();
        const top = target.getBoundingClientRect().top + window.pageYOffset - navH;
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      }, 0);
    }
  }
}

// 数字计数动画
function animateCounter(el, target, duration = 2000) {
  if (!el) return;

  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = Math.floor(target);
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

// 初始化统计数字动画
function initCounters() {
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute("data-count")) || 0;
        const suffix = counter.textContent.includes("%") ? "%" : "";

        animateCounter(counter, target, 2000);
        observer.unobserve(counter);
      }
    });
  }, observerOptions);

  qsa("[data-count]").forEach((counter) => {
    observer.observe(counter);
  });
}

// Hero 区域统计数字
function initHeroCounters() {
  const heroStats = qs(".hero-stats");
  if (!heroStats) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll("[data-count]");
          counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute("data-count")) || 0;
            animateCounter(counter, target, 2000);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(heroStats);
}

// 卡片进入动画
function initCardAnimations() {
  const cards = qsa(".service-card, .project-card, .team-card");
  if (cards.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(card);
  });
}

// 表单提交处理
function initContactForm() {
  const form = qs("#contactForm");
  const hint = qs("#formHint");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 获取表单数据
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // 这里可以接入后端API
    console.log("表单数据:", data);

    // 显示提示
    if (hint) {
      hint.textContent = "感谢您的留言！我们会尽快与您联系。";
      hint.style.color = "var(--secondary)";
    }

    // 重置表单
    setTimeout(() => {
      form.reset();
      if (hint) {
        hint.textContent = "表单提交功能待接入后端服务";
        hint.style.color = "";
      }
    }, 3000);
  });
}

// 滚动到顶部按钮（可选）
function initScrollToTop() {
  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-arrow-up"></i>';
  button.className = "scroll-to-top";
  button.setAttribute("aria-label", "返回顶部");
  document.body.appendChild(button);

  button.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  `;

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      button.style.opacity = "1";
      button.style.visibility = "visible";
    } else {
      button.style.opacity = "0";
      button.style.visibility = "hidden";
    }
  });

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-5px)";
    button.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.6)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
  });
}

// 项目卡片悬停效果增强
function enhanceProjectCards() {
  const projectCards = qsa(".project-card");
  projectCards.forEach((card) => {
    const image = card.querySelector(".project-image");
    if (!image) return;

    card.addEventListener("mouseenter", () => {
      image.style.transform = "scale(1.05)";
    });

    card.addEventListener("mouseleave", () => {
      image.style.transform = "scale(1)";
    });
  });
}

// 服务卡片图标动画
function animateServiceIcons() {
  const serviceIcons = qsa(".service-icon");
  serviceIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      icon.style.transform = "rotate(5deg) scale(1.1)";
    });

    icon.addEventListener("mouseleave", () => {
      icon.style.transform = "rotate(0) scale(1)";
    });
  });
}

// 懒加载图片（如果后续添加真实图片）
function initLazyLoading() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          imageObserver.unobserve(img);
        }
      });
    });

    qsa("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// 页面加载动画
function initPageLoader() {
  const loader = document.createElement("div");
  loader.className = "page-loader";
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-spinner"></div>
      <p>加载中...</p>
    </div>
  `;
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--gradient-1);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s ease, visibility 0.5s ease;
  `;

  const spinnerStyle = `
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loader-content {
      text-align: center;
      color: white;
    }
    .loader-content p {
      margin-top: 1rem;
      font-weight: 500;
    }
    .loader-spinner {
      ${spinnerStyle}
      margin: 0 auto;
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(loader);

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.visibility = "hidden";
      setTimeout(() => {
        loader.remove();
      }, 500);
    }, 500);
  });
}

// 初始化所有功能
document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initNavbar();
  initHeroCounters();
  initCounters();
  initCardAnimations();
  initContactForm();
  initScrollToTop();
  enhanceProjectCards();
  animateServiceIcons();
  initLazyLoading();
  // initPageLoader(); // 如果需要加载动画，取消注释
});

// 窗口大小改变时重新计算
window.addEventListener("resize", () => {
  // 可以在这里添加响应式相关的重新计算
});
