document.addEventListener('DOMContentLoaded', function() {
    // 确保只在文章页面运行
    if (!document.querySelector('.article-content')) return;

    // 创建目录
    function generateTOC() {
        const headings = document.querySelectorAll('.content h2, .content h3, .content h4');
        const tocContent = document.getElementById('toc-content');

        if (!tocContent || headings.length === 0) {
            if (tocContent) {
                tocContent.innerHTML = '<p class="no-toc">本文没有标题结构</p>';
            }
            return;
        }

        let tocHTML = '<ul class="toc-root">';
        let currentLevel = 0;
        let openLists = 0;

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1)) - 2; // h2=0, h3=1, h4=2

            // 确保标题有ID
            if (!heading.id) {
                heading.id = `heading-${index}-${Date.now()}`;
            }

            // 处理层级变化
            if (level > currentLevel) {
                // 进入更深层级
                for (let i = currentLevel; i < level; i++) {
                    tocHTML += '<ul class="toc-sublist">';
                    openLists++;
                }
            } else if (level < currentLevel) {
                // 返回上层级
                for (let i = currentLevel; i > level; i--) {
                    tocHTML += '</ul></li>';
                    openLists--;
                }
            } else if (index > 0) {
                // 同级项目
                tocHTML += '</li>';
            }

            currentLevel = level;

            // 图标选择
            let icon = 'fas fa-bookmark';
            if (level === 1) icon = 'fas fa-book';
            if (level === 2) icon = 'fas fa-book-open';

            tocHTML += `
        <li class="toc-item level-${level}">
          <a href="#${heading.id}" class="toc-link">
            <i class="${icon}"></i>
            ${heading.textContent}
          </a>
      `;
        });

        // 关闭所有打开的标签
        while (openLists > 0) {
            tocHTML += '</ul></li>';
            openLists--;
        }

        tocHTML += '</ul>';
        tocContent.innerHTML = tocHTML;
    }

    // 设置滚动高亮
    function setupScrollHighlight() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocLink = document.querySelector(`.toc-link[href="#${id}"]`);

                if (tocLink) {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.toc-link.active').forEach(el => {
                            el.classList.remove('active');
                        });
                        tocLink.classList.add('active');

                        // 滚动目录使当前项居中
                        const tocContent = document.querySelector('.toc-content');
                        if (tocContent.scrollHeight > tocContent.clientHeight) {
                            tocLink.scrollIntoView({
                                behavior: 'auto',
                                block: 'center',
                                inline: 'nearest'
                            });
                        }
                    }
                }
            });
        }, {
            rootMargin: '0px 0px -45% 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.content h2, .content h3, .content h4').forEach(heading => {
            observer.observe(heading);
        });
    }

    // 设置平滑滚动
    function setupSmoothScrolling() {
        document.addEventListener('click', function(e) {
            const tocLink = e.target.closest('.toc-link');
            if (tocLink) {
                e.preventDefault();
                const targetId = tocLink.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // 移动端点击后关闭目录
                    if (window.innerWidth < 768) {
                        document.querySelector('.toc-container').classList.remove('active');
                    }

                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    // 设置目录交互
    function setupTocInteractions() {
        // 移动端目录按钮
        const mobileToggle = document.querySelector('.toc-mobile-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                document.querySelector('.toc-container').classList.toggle('active');
            });
        }

        // 关闭按钮
        const closeBtn = document.querySelector('.toc-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.querySelector('.toc-container').classList.remove('active');
            });
        }

        // 点击外部关闭目录
        document.addEventListener('click', (e) => {
            const tocContainer = document.querySelector('.toc-container');
            if (tocContainer && tocContainer.classList.contains('active') &&
                !e.target.closest('.toc-container') &&
                !e.target.closest('.toc-mobile-toggle')) {
                tocContainer.classList.remove('active');
            }
        });

        // 添加折叠/展开功能
        document.querySelectorAll('.toc-item.level-0, .toc-item.level-1').forEach(item => {
            const link = item.querySelector('.toc-link');
            const sublist = item.querySelector('.toc-sublist');

            if (sublist) {
                // 添加折叠指示器
                const indicator = document.createElement('i');
                indicator.className = 'fas fa-chevron-down collapse-indicator';
                indicator.style.marginLeft = 'auto';
                indicator.style.transition = 'transform 0.3s ease';
                link.appendChild(indicator);

                // 初始展开状态
                sublist.style.display = 'block';
                indicator.style.transform = 'rotate(0deg)';

                link.addEventListener('click', (e) => {
                    // 阻止默认滚动行为
                    if (e.target.tagName === 'I' || e.target.className.includes('collapse-indicator')) {
                        e.preventDefault();
                        e.stopPropagation();

                        if (sublist.style.display === 'block') {
                            sublist.style.display = 'none';
                            indicator.style.transform = 'rotate(-90deg)';
                        } else {
                            sublist.style.display = 'block';
                            indicator.style.transform = 'rotate(0deg)';
                        }
                    }
                });
            }
        });
    }

    // 初始化
    generateTOC();
    setupScrollHighlight();
    setupSmoothScrolling();
    setupTocInteractions();

    // 加密内容特殊处理
    if (document.getElementById('crypto')) {
        const cryptoInput = document.getElementById('crypto');

        cryptoInput.addEventListener('input', function() {
            if (cryptoInput.value === '') return;

            // 假设解密成功后重新生成目录
            setTimeout(() => {
                generateTOC();
                setupScrollHighlight();
                setupSmoothScrolling();
                setupTocInteractions();
            }, 500);
        });
    }
});