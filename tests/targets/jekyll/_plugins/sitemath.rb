# frozen_string_literal: true

module SiteMathFixture
  FENCE = /^```sitemath[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/m.freeze

  def self.extract(source)
    source.to_s.scan(FENCE).flatten
  end

  def self.remove(source)
    source.to_s.gsub(FENCE, "")
  end
end

class SiteMathFixtureGenerator < Jekyll::Generator
  safe true
  priority :highest

  def generate(site)
    site.pages.each do |page|
      blocks = SiteMathFixture.extract(page.content)
      next unless blocks.length == 1

      page.data["sitemath_source"] = blocks.first
      page.content = SiteMathFixture.remove(page.content)
    end
  end
end
